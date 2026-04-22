import { Expose } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class PromotionAvailableResponseDto {
  @ApiProperty({
    type: String,
    description: 'Promotion ID',
    example: 'uuid-promo-id',
  })
  @Expose()
  id: string;

  @ApiProperty({
    type: String,
    description: 'Promotion code',
    example: 'SALE10',
  })
  @Expose()
  code: string;

  @ApiProperty({
    type: String,
    description: 'Promotion title',
    example: 'Discount 10%',
  })
  @Expose()
  title: string;

  @ApiProperty({
    type: String,
    description: 'Discount type',
    example: 'PERCENTAGE',
  })
  @Expose()
  discountType: string;

  @ApiProperty({
    type: Number,
    description: 'Discount value',
    example: 10,
  })
  @Expose()
  discountValue: number;

  @ApiProperty({
    type: Boolean,
    description: 'Whether the promotion can be applied to the current order',
    example: true,
  })
  @Expose()
  isEligible: boolean;

  @ApiProperty({
    type: [String],
    description: 'Reasons why promotion is not eligible',
    example: ['MIN_ORDER_NOT_MET'],
  })
  @Expose()
  ineligibleReasons: string[];
}

export class PromotionAvailableListResponseDto {
  @ApiProperty({
    type: [PromotionAvailableResponseDto],
  })
  items: PromotionAvailableResponseDto[];

  @ApiProperty({
    type: Number,
  })
  total: number;
}