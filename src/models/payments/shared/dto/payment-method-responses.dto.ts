import { ApiProperty } from '@nestjs/swagger';
import { Exclude, Expose } from 'class-transformer';
import { PaymentFeeType, PaymentProvider } from '../enums';

@Exclude()
export class PublicPaymentMethodResponseDto {
  @ApiProperty({
    example: 'b1a2c3d4-e5f6-7890-1234-56789abcdef0',
    description: 'Unique identifier for the payment method',
  })
  @Expose()
  id: string;

  @ApiProperty({
    enum: PaymentProvider,
    example: PaymentProvider.MOMO,
    description: 'Payment provider',
  })
  @Expose()
  provider: PaymentProvider;

  @ApiProperty({
    example: 'Momo Wallet',
    description: 'Internal name of the payment method',
  })
  @Expose()
  name: string;

  @ApiProperty({
    example: 'https://cdn.example.com/icons/momo.png',
    description: 'URL to the payment method icon',
    nullable: true,
  })
  @Expose()
  iconUrl: string | null;

  @ApiProperty({ example: 1, description: 'Sort order for display in UI' })
  @Expose()
  sortOrder: number;
}

export class PaymentMethodResponseDto extends PublicPaymentMethodResponseDto {
  @ApiProperty({
    example: true,
    description: 'Whether the payment method is currently enabled/active',
  })
  @Expose()
  isActive: boolean;

  @ApiProperty({
    enum: PaymentFeeType,
    example: PaymentFeeType.PERCENTAGE,
    nullable: true,
    description: 'Type of fee applied (percentage or fixed amount)',
  })
  @Expose()
  feeType: PaymentFeeType | null;

  @ApiProperty({
    example: 2.5,
    nullable: true,
    description: 'Fee value (percentage or fixed amount depending on feeType)',
  })
  @Expose()
  feeValue: number | null;

  @ApiProperty({
    example: '2024-04-19T12:34:56.789Z',
    description: 'Creation timestamp (ISO 8601 format)',
    nullable: true,
  })
  @Expose()
  createdAt: Date | null;

  @ApiProperty({
    example: '2024-04-19T12:34:56.789Z',
    description: 'Last update timestamp (ISO 8601 format)',
    nullable: true,
  })
  @Expose()
  updatedAt: Date | null;
}
