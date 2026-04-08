import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Exclude, Expose, Type } from 'class-transformer';

// ---------- sub-shapes ----------

@Exclude()
class PaymentMethodDto {
  @ApiProperty() @Expose() id: string;
  @ApiProperty() @Expose() displayName: string;
  @ApiProperty() @Expose() provider: string;
}

@Exclude()
class PaymentDto {
  @ApiProperty() @Expose() id: string;
  @ApiProperty() @Expose() amount: number;
  @ApiProperty() @Expose() status: string;
  @ApiPropertyOptional({ nullable: true }) @Expose() feeAmount: number | null;
  @ApiPropertyOptional({ nullable: true }) @Expose() referenceNumber:
    | string
    | null;
  @ApiPropertyOptional({ nullable: true }) @Expose() paidAt: Date | null;
  @ApiProperty({ type: () => PaymentMethodDto })
  @Expose()
  @Type(() => PaymentMethodDto)
  method: PaymentMethodDto;
}

@Exclude()
class OrderTaxDto {
  @ApiProperty() @Expose() id: string;
  @ApiProperty() @Expose() taxName: string;
  @ApiProperty() @Expose() taxType: string;
  @ApiProperty() @Expose() rateType: string;
  @ApiProperty() @Expose() chargeRate: number;
  @ApiProperty() @Expose() taxableBase: number;
  @ApiProperty() @Expose() taxAmount: number;
  @ApiPropertyOptional({ nullable: true }) @Expose() quantity: number | null;
}

@Exclude()
class RedemptionDto {
  @ApiProperty() @Expose() id: string;
  @ApiProperty() @Expose() promotionId: string;
  @ApiProperty() @Expose() orderId: string;
  @ApiProperty() @Expose() redeemedAt: Date;
}

// ---------- main response ----------

@Exclude()
export class ProcessPaymentResponseDto {
  @ApiProperty({ type: () => PaymentDto })
  @Expose()
  @Type(() => PaymentDto)
  payment: PaymentDto;

  @ApiProperty({ type: () => [OrderTaxDto] })
  @Expose()
  @Type(() => OrderTaxDto)
  orderTaxes: OrderTaxDto[];

  @ApiProperty({ type: () => [RedemptionDto] })
  @Expose()
  @Type(() => RedemptionDto)
  redemptions: RedemptionDto[];
}

// ---------- receipt response (GET /order/:id/receipt) ----------

@Exclude()
class ReceiptOrderDto {
  @ApiProperty() @Expose() id: string;
  @ApiProperty() @Expose() status: string;
  @ApiProperty() @Expose() subtotalAmount: number;
  @ApiProperty() @Expose() totalAmount: number;
  @ApiPropertyOptional({ nullable: true }) @Expose() note: string | null;
  @ApiProperty() @Expose() createdAt: Date;
}

@Exclude()
export class ReceiptResponseDto {
  @ApiProperty({ type: () => ReceiptOrderDto })
  @Expose()
  @Type(() => ReceiptOrderDto)
  order: ReceiptOrderDto;

  @ApiProperty({ type: () => [OrderTaxDto] })
  @Expose()
  @Type(() => OrderTaxDto)
  orderTaxes: OrderTaxDto[];

  @ApiProperty({ type: () => [RedemptionDto] })
  @Expose()
  @Type(() => RedemptionDto)
  redemptions: RedemptionDto[];
}
