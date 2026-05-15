import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import {
  OrderStatus,
  PaymentStatus,
  Prisma,
} from '@prisma/client';
import { randomBytes } from 'crypto';
import { PrismaService } from '../prisma/prisma.service';
import { IdempotencyService } from '../common/idempotency.service';
import { sha256Hex } from '../common/crypto.util';
import { PaystackService } from './paystack.service';
import type { InitializePaymentDto } from './dto/initialize-payment.dto';

const INIT_SCOPE = 'payment.initialize';

@Injectable()
export class PaymentsService {
  private readonly logger = new Logger(PaymentsService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly paystack: PaystackService,
    private readonly idempotency: IdempotencyService,
  ) {}

  /**
   * Idempotent Paystack initialize — requires `Idempotency-Key` header (see controller).
   * Amount uses order.total (already in kobo / smallest unit).
   */
  async initializePayment(
    userId: string,
    dto: InitializePaymentDto,
    idempotencyKey: string,
  ) {
    const fingerprint = sha256Hex(
      JSON.stringify({
        orderId: dto.orderId,
        callbackUrl: dto.callbackUrl ?? null,
      }),
    );

    const result = await this.idempotency.run(
      INIT_SCOPE,
      idempotencyKey,
      fingerprint,
      86_400,
      async () => {
        const order = await this.prisma.order.findFirst({
          where: { id: dto.orderId, userId },
          include: { user: true },
        });
        if (!order) {
          throw new NotFoundException('Order not found');
        }
        if (
          order.status !== OrderStatus.PENDING_PAYMENT &&
          order.status !== OrderStatus.DRAFT
        ) {
          throw new BadRequestException(
            'Order is not awaiting payment in a payable state',
          );
        }

        if (
          dto.expectedOrderTotalKobo !== undefined &&
          dto.expectedOrderTotalKobo !== null &&
          Number(dto.expectedOrderTotalKobo) !== Number(order.total)
        ) {
          throw new BadRequestException(
            'expectedOrderTotalKobo does not match this order total. Omit the field and use the server amount, or pass the exact total (kobo) returned when the order was created.',
          );
        }

        const reference = `ewa_${randomBytes(14).toString('hex')}`;
        const paystack = await this.paystack.initializeTransaction({
          email: order.user.email,
          amount: order.total,
          reference,
          callback_url: dto.callbackUrl,
          metadata: { orderId: order.id, userId: order.userId },
        });

        if (!paystack.status || !paystack.data) {
          throw new BadRequestException(
            paystack.message ?? 'Unable to start Paystack transaction',
          );
        }

        await this.prisma.payment.create({
          data: {
            orderId: order.id,
            amount: order.total,
            currency: order.currency,
            paystackReference: paystack.data.reference,
            status: PaymentStatus.PENDING,
            idempotencyKey,
            authorizationUrl: paystack.data.authorization_url,
            metadata: paystack.data as unknown as Prisma.InputJsonValue,
          },
        });

        const body = {
          authorizationUrl: paystack.data.authorization_url,
          accessCode: paystack.data.access_code,
          reference: paystack.data.reference,
          replayed: false,
        };
        return { statusCode: 200, body };
      },
    );

    return { ...result.body, replayed: result.replayed };
  }

  async verifyAndSync(reference: string) {
    const remote = await this.paystack.verifyTransaction(reference);
    if (!remote.status || !remote.data?.reference) {
      return { ok: false, message: remote.message };
    }

    const payment = await this.prisma.payment.findUnique({
      where: { paystackReference: reference },
      include: { order: { include: { items: true } } },
    });
    if (!payment) return { ok: false, message: 'Unknown payment reference' };

    if (remote.data.status !== 'success') {
      return {
        ok: false,
        message: remote.message ?? 'Payment not completed',
        paymentId: payment.id,
      };
    }

    const paystackAmount = Number(remote.data.amount);
    if (
      !Number.isFinite(paystackAmount) ||
      Math.round(paystackAmount) !== payment.amount
    ) {
      this.logger.warn(
        `Paystack amount mismatch for ${reference}: remote=${remote.data.amount} expected=${payment.amount}`,
      );
      return { ok: false, message: 'Payment amount verification failed' };
    }

    const remoteCurrency = (remote.data as { currency?: string }).currency;
    if (
      remoteCurrency &&
      remoteCurrency.toUpperCase() !== payment.currency.toUpperCase()
    ) {
      this.logger.warn(
        `Paystack currency mismatch for ${reference}: ${remoteCurrency} vs ${payment.currency}`,
      );
      return { ok: false, message: 'Payment currency verification failed' };
    }

    const meta = remote.data.metadata as
      | { orderId?: string; userId?: string }
      | undefined;
    if (meta?.orderId && meta.orderId !== payment.orderId) {
      this.logger.warn(
        `Paystack metadata orderId mismatch for ${reference}: ${meta.orderId} vs ${payment.orderId}`,
      );
      return { ok: false, message: 'Payment metadata verification failed' };
    }

    if (
      payment.status === PaymentStatus.SUCCESS &&
      payment.order.status === OrderStatus.PAID
    ) {
      return { ok: true, paymentId: payment.id, alreadyPaid: true };
    }

    await this.prisma.$transaction(async (tx) => {
      await tx.$queryRaw(Prisma.sql`
        SELECT id FROM "Payment" WHERE id = ${payment.id}::uuid FOR UPDATE
      `);

      const locked = await tx.payment.findUnique({
        where: { id: payment.id },
        include: { order: { include: { items: true } } },
      });
      if (!locked) return;

      if (
        locked.status === PaymentStatus.SUCCESS &&
        locked.order.status === OrderStatus.PAID
      ) {
        return;
      }

      await tx.payment.update({
        where: { id: locked.id },
        data: {
          status: PaymentStatus.SUCCESS,
          paidAt: new Date(),
          metadata: remote.data as unknown as Prisma.InputJsonValue,
        },
      });
      await tx.order.update({
        where: { id: locked.orderId },
        data: { status: OrderStatus.PAID },
      });

      const productIds = [
        ...new Set(
          locked.order.items
            .map((i) => i.productId)
            .filter((id): id is string => id != null),
        ),
      ];
      if (!productIds.length) return;

      await tx.orderItem.updateMany({
        where: { orderId: locked.orderId, productId: { in: productIds } },
        data: { productId: null },
      });
      await tx.cartItem.deleteMany({
        where: { productId: { in: productIds } },
      });
      await tx.product.deleteMany({ where: { id: { in: productIds } } });
    });

    return { ok: true, paymentId: payment.id };
  }

  /**
   * Verifies a Paystack transaction by reference (e.g. after hosted redirect).
   * Suitable for guest checkout when the browser has no auth session.
   */
  async verifyPaystackByReference(reference: string) {
    const payment = await this.prisma.payment.findUnique({
      where: { paystackReference: reference },
      include: { order: true },
    });
    if (!payment) {
      throw new NotFoundException('Unknown payment reference');
    }
    const sync = await this.verifyAndSync(reference);
    const order = await this.prisma.order.findUnique({
      where: { id: payment.orderId },
      select: { id: true, status: true, total: true },
    });
    const pay = await this.prisma.payment.findUnique({
      where: { id: payment.id },
      select: { status: true, paystackReference: true },
    });
    return { ...sync, order, payment: pay };
  }

  /**
   * Confirms a Paystack transaction for the authenticated owner of the payment.
   */
  async verifyPaystackForUser(userId: string, reference: string) {
    const payment = await this.prisma.payment.findUnique({
      where: { paystackReference: reference },
      include: { order: true },
    });
    if (!payment || payment.order.userId !== userId) {
      throw new ForbiddenException('Unknown payment reference');
    }
    return this.verifyPaystackByReference(reference);
  }

  async listForUser(userId: string, orderId?: string) {
    return this.prisma.payment.findMany({
      where: {
        order: {
          userId,
          ...(orderId ? { id: orderId } : {}),
        },
      },
      orderBy: { createdAt: 'desc' },
      take: 100,
      include: { order: { select: { id: true, status: true, total: true } } },
    });
  }
}
