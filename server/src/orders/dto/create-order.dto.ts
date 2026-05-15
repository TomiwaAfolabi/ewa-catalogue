import { Type } from 'class-transformer';
import {
  IsArray,
  IsEmail,
  IsInt,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
  Min,
  ValidateNested,
} from 'class-validator';

export class OrderLineInputDto {
  @IsUUID()
  productId: string;

  @IsInt()
  @Min(1)
  quantity: number;

  /**
   * Must equal the product row `price` (kobo) at order time.
   * Prevents tampered client totals; refresh catalogue if prices changed.
   */
  @IsInt()
  @Min(0)
  expectedUnitPriceKobo: number;

  @IsOptional()
  @IsString()
  @MaxLength(64, { message: 'Selected size is too long' })
  selectedSize?: string;
}

export class CreateOrderDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => OrderLineInputDto)
  items: OrderLineInputDto[];

  @IsOptional()
  shippingSnapshot?: Record<string, unknown>;

  @IsOptional()
  @IsString()
  @MaxLength(2000, { message: 'Order notes must be at most 2000 characters' })
  notes?: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  shippingAmount?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  taxAmount?: number;

  /**
   * Required for guest checkout when the request is not tied to an authenticated user.
   * Paystack and receipts use this email; must match a valid inbox.
   */
  @IsOptional()
  @IsEmail()
  @MaxLength(254)
  guestCheckoutEmail?: string;
}
