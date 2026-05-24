import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { OrderStatus, Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import type { CreateOrderDto } from './dto/create-order.dto';

/** Rough upper bound for JSON shipping snapshot (UTF-8 bytes). */
const SHIPPING_SNAPSHOT_MAX_BYTES = 24_000;

function sanitizeOrderNotes(raw: string | undefined): string | undefined {
  if (raw == null) return undefined;
  const t = raw.trim();
  if (!t) return undefined;
  return t.replace(/[<>]/g, '');
}

/** Strip angle brackets from string leaves in the shipping snapshot (defense in depth). */
function sanitizeShippingSnapshot(
  raw: Record<string, unknown> | undefined,
): Record<string, unknown> | undefined {
  if (raw == null) return undefined;
  const walk = (v: unknown): unknown => {
    if (typeof v === 'string') return v.replace(/[<>]/g, '');
    if (Array.isArray(v)) return v.map(walk);
    if (v != null && typeof v === 'object') {
      const out: Record<string, unknown> = {};
      for (const [k, val] of Object.entries(v as Record<string, unknown>)) {
        out[k] = walk(val);
      }
      return out;
    }
    return v;
  };
  const result = walk(raw);
  return result != null && typeof result === 'object' && !Array.isArray(result)
    ? (result as Record<string, unknown>)
    : raw;
}

/** Placeholder password hash for catalogue-only guest users (not used for login). */
const GUEST_USER_PASSWORD_HASH =
  '$2b$10$E1lZDdpa7prDIGQAK.GGOuEZTaRMHpIB4x/TsO7rShJUyOWGq3Kiy';

@Injectable()
export class OrdersService {
  constructor(private readonly prisma: PrismaService) {}

  private async resolveCheckoutUserIdInTx(
    tx: Prisma.TransactionClient,
    authenticatedUserId: string | null | undefined,
    dto: CreateOrderDto,
  ): Promise<string> {
    if (authenticatedUserId) return authenticatedUserId;
    const snap = dto.shippingSnapshot as Record<string, unknown> | undefined;
    const snapEmail =
      typeof snap?.guestCheckoutEmail === 'string'
        ? snap.guestCheckoutEmail.trim().toLowerCase()
        : undefined;
    const email = dto.guestCheckoutEmail?.trim().toLowerCase() || snapEmail;
    if (!email) {
      throw new BadRequestException(
        'guestCheckoutEmail is required when not signed in',
      );
    }
    const row = await tx.user.upsert({
      where: { email },
      create: {
        email,
        passwordHash: GUEST_USER_PASSWORD_HASH,
      },
      update: {},
      select: { id: true },
    });
    return row.id;
  }

  async create(
    authenticatedUserId: string | null | undefined,
    dto: CreateOrderDto,
  ) {
    if (!dto.items?.length) {
      throw new BadRequestException('Order must contain at least one line');
    }

    const shippingSnapshot = sanitizeShippingSnapshot(dto.shippingSnapshot);

    if (shippingSnapshot != null) {
      let bytes: number;
      try {
        bytes = new TextEncoder().encode(
          JSON.stringify(shippingSnapshot),
        ).length;
      } catch {
        throw new BadRequestException(
          'Delivery details could not be processed. Remove unusual characters and try again.',
        );
      }
      if (bytes > SHIPPING_SNAPSHOT_MAX_BYTES) {
        throw new BadRequestException(
          'Delivery details are too long. Please shorten address or contact fields.',
        );
      }
    }

    const notes = sanitizeOrderNotes(dto.notes);

    const productIds = [...new Set(dto.items.map((i) => i.productId))];
    if (productIds.length !== dto.items.length) {
      throw new BadRequestException(
        'Each product may appear only once per order (exclusive items).',
      );
    }
    for (const line of dto.items) {
      if (line.quantity !== 1) {
        throw new BadRequestException(
          'Only one unit per product is allowed for this catalogue.',
        );
      }
    }

    return this.prisma.$transaction(
      async (tx) => {
        const ownerUserId = await this.resolveCheckoutUserIdInTx(
          tx,
          authenticatedUserId,
          dto,
        );

        for (const id of productIds) {
          await tx.$queryRaw(Prisma.sql`
            SELECT id FROM "Product" WHERE id = ${id}::uuid FOR UPDATE
          `);
        }

        for (const id of productIds) {
          const reserved = await tx.product.updateMany({
            where: { id, inStock: true },
            data: { inStock: false },
          });
          if (reserved.count !== 1) {
            throw new BadRequestException(
              'One or more items are no longer available. Refresh the catalogue.',
            );
          }
        }

        const products = await tx.product.findMany({
          where: { id: { in: productIds } },
        });
        const byId = new Map(products.map((p) => [p.id, p]));

        let subtotal = 0;
        const lines: Prisma.OrderItemCreateWithoutOrderInput[] = [];

        for (const line of dto.items) {
          const p = byId.get(line.productId);
          if (!p) throw new NotFoundException(`Product ${line.productId} not found`);
          if (line.expectedUnitPriceKobo !== p.price) {
            throw new BadRequestException(
              `Price for "${p.title}" no longer matches the catalogue. Refresh and try again.`,
            );
          }
          const lineTotal = p.price * line.quantity;
          subtotal += lineTotal;
          lines.push({
            product: { connect: { id: p.id } },
            title: p.title,
            unitPrice: p.price,
            quantity: line.quantity,
            selectedSize: line.selectedSize ?? null,
          });
        }

        const shippingAmount = dto.shippingAmount ?? 0;
        const taxAmount = dto.taxAmount ?? 0;
        const total = subtotal + shippingAmount + taxAmount;

        const order = await tx.order.create({
          data: {
            userId: ownerUserId,
            status: OrderStatus.PENDING_PAYMENT,
            subtotal,
            shippingAmount,
            taxAmount,
            total,
            shippingSnapshot: shippingSnapshot as Prisma.InputJsonValue | undefined,
            notes,
            items: { create: lines },
          },
          include: { items: true },
        });

        return order;
      },
      { maxWait: 10_000, timeout: 25_000 },
    );
  }

  async listForUser(userId: string, page = 1, perPage = 20) {
    const take = Math.min(perPage, 50);
    const where = { userId };
    const [total, data] = await this.prisma.$transaction([
      this.prisma.order.count({ where }),
      this.prisma.order.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * take,
        take,
        include: { items: true, payments: true },
      }),
    ]);
    return { data, total, page, perPage: take, totalPages: Math.ceil(total / take) || 0 };
  }

  async getForUser(userId: string, orderId: string) {
    const order = await this.prisma.order.findFirst({
      where: { id: orderId, userId },
      include: { items: true, payments: true },
    });
    if (!order) throw new NotFoundException('Order not found');
    return order;
  }

  async cancel(userId: string, orderId: string) {
    return this.prisma.$transaction(async (tx) => {
      const order = await tx.order.findFirst({
        where: { id: orderId, userId },
      });
      if (!order) throw new NotFoundException('Order not found');
      if (
        order.status !== OrderStatus.PENDING_PAYMENT &&
        order.status !== OrderStatus.DRAFT
      ) {
        throw new BadRequestException('Only unpaid orders can be cancelled');
      }

      const lines = await tx.orderItem.findMany({
        where: { orderId },
        select: { productId: true },
      });
      const productIds = [
        ...new Set(
          lines.map((l) => l.productId).filter((id): id is string => id != null),
        ),
      ];
      if (productIds.length) {
        await tx.product.updateMany({
          where: { id: { in: productIds } },
          data: { inStock: true },
        });
      }

      return tx.order.update({
        where: { id: orderId },
        data: { status: OrderStatus.CANCELLED },
        include: { items: true, payments: true },
      });
    });
  }
}
