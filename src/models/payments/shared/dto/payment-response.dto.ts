import { ApiProperty } from '@nestjs/swagger';
import { Exclude, Expose, Type } from 'class-transformer';
import { OrderStatus } from '../../../orders/shared/enums';
import { PaymentProvider, PaymentStatus } from '../enums';

@Exclude()
export class PaymentMethodDto {
  @ApiProperty({
    example: '6d6d2a9a-69be-4cad-9a2f-68838f17cc19',
    description: 'Payment method ID',
  })
  @Expose()
  id: string;

  @ApiProperty({
    example: 'Momo Wallet',
    description: 'Payment method name',
  })
  @Expose()
  name: string;

  @ApiProperty({
    enum: PaymentProvider,
    example: PaymentProvider.MOMO,
    description: 'Payment provider',
  })
  @Expose()
  provider: PaymentProvider;
}

@Exclude()
export class PaymentOrderDto {
  @ApiProperty({
    example: 'f75f5f4c-8f83-41f0-9194-ff6736fb1ec2',
    description: 'Order ID',
  })
  @Expose()
  id: string;

  @ApiProperty({
    enum: OrderStatus,
    example: OrderStatus.COMPLETED,
    description: 'Order status',
  })
  @Expose()
  status: OrderStatus;

  @ApiProperty({
    example: 150000,
    description: 'Final order total amount',
  })
  @Expose()
  totalAmount: number;
}

@Exclude()
export class PaymentUserDto {
  @ApiProperty({
    example: '09fd5c9b-2759-477d-9f42-a2f143fd6520',
    description: 'User ID',
  })
  @Expose()
  id: string;

  @ApiProperty({
    example: 'John Doe',
    description: 'Full name',
  })
  @Expose()
  fullName: string;

  @ApiProperty({
    example: 'MANAGER',
    description: 'User role',
  })
  @Expose()
  role: string;
}

@Exclude()
export class PaymentResponseDto {
  @ApiProperty({
    example: '1c8ffc98-4759-4f65-96f6-e6e5ef5ac5f5',
    description: 'Payment ID',
  })
  @Expose()
  id: string;

  @ApiProperty({
    type: PaymentMethodDto,
    description: 'Essential payment method information',
    nullable: true,
  })
  @Expose()
  @Type(() => PaymentMethodDto)
  method: PaymentMethodDto | null;

  @ApiProperty({
    type: PaymentOrderDto,
    description: 'Essential order information',
    nullable: true,
  })
  @Expose()
  @Type(() => PaymentOrderDto)
  order: PaymentOrderDto | null;

  @ApiProperty({
    type: PaymentUserDto,
    description: 'Essential creator user information',
    nullable: true,
  })
  @Expose()
  @Type(() => PaymentUserDto)
  user: PaymentUserDto | null;

  @ApiProperty({
    example: 150000,
    description: 'Payment amount',
  })
  @Expose()
  amount: number;

  @ApiProperty({
    example: 0,
    description: 'Payment fee amount',
    nullable: true,
  })
  @Expose()
  feeAmount: number | null;

  @ApiProperty({
    example: 'MOMO-TRX-001',
    description: 'Gateway transaction reference',
    nullable: true,
  })
  @Expose()
  referenceNumber: string | null;

  @ApiProperty({
    enum: PaymentStatus,
    example: PaymentStatus.COMPLETED,
    description: 'Payment status',
  })
  @Expose()
  status: PaymentStatus;

  @ApiProperty({
    example: 'https://pay.example.com/checkout/123',
    description: 'External payment URL',
    nullable: true,
  })
  @Expose()
  paymentUrl: string | null;

  @ApiProperty({
    example: '2026-04-19T12:30:00.000Z',
    description: 'Payment completion time',
    nullable: true,
  })
  @Expose()
  paidAt: Date | null;

  @ApiProperty({
    example: '2026-04-19T13:00:00.000Z',
    description: 'Payment expiration time',
    nullable: true,
  })
  @Expose()
  expiredAt: Date | null;

  @ApiProperty({
    example: { providerTxnId: 'abc123' },
    description: 'Arbitrary payment metadata',
    nullable: true,
  })
  @Expose()
  metadata: Record<string, any> | null;

  @ApiProperty({
    example: '2026-04-19T12:00:00.000Z',
    description: 'Creation timestamp',
    nullable: true,
  })
  @Expose()
  createdAt: Date | null;

  @ApiProperty({
    example: '2026-04-19T12:05:00.000Z',
    description: 'Last update timestamp',
    nullable: true,
  })
  @Expose()
  updatedAt: Date | null;
}
