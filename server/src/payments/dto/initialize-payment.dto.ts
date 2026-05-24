import { IsEmail, IsInt, IsOptional, IsString, IsUUID, MaxLength, Min } from 'class-validator';

export class InitializePaymentDto {
  @IsUUID()
  orderId: string;

  @IsOptional()
  @IsString()
  @MaxLength(2048)
  callbackUrl?: string;

  /**
   * Optional tamper-check: when sent, must equal the persisted order total (kobo).
   * Clients should omit this and rely on the server amount, or pass the exact
   * `total` from `POST /v1/orders` for the same `orderId`.
   */
  @IsOptional()
  @IsInt()
  @Min(0)
  expectedOrderTotalKobo?: number;

  /** Guest checkout — required by API when the request is not authenticated. */
  @IsOptional()
  @IsEmail()
  @MaxLength(254)
  guestCheckoutEmail?: string;
}
