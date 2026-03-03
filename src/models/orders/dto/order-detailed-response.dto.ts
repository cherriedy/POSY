import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Exclude, Expose, Type } from 'class-transformer';
import { OrderStatus } from '../enums';

@Exclude()
class OrderUserResponseDto {
  @ApiProperty({ type: String, description: 'User ID' })
  @Expose()
  id: string;

  @ApiProperty({ type: String, description: 'Username' })
  @Expose()
  username: string;

  @ApiProperty({ type: String, description: 'Full name' })
  @Expose()
  fullName: string;

  @ApiProperty({ type: String, description: 'Role' })
  @Expose()
  role: string;
}

@Exclude()
class OrderTableResponseDto {
  @ApiProperty({ type: String, description: 'Table ID' })
  @Expose()
  id: string;

  @ApiProperty({ type: String, description: 'Table name' })
  @Expose()
  name: string;

  @ApiProperty({ type: Number, description: 'Capacity' })
  @Expose()
  capacity: number;

  @ApiProperty({ type: String, description: 'Status' })
  @Expose()
  status: string;
}

@Exclude()
class OrderSessionResponseDto {
  @ApiProperty({ type: String, description: 'Session ID' })
  @Expose()
  id: string;

  @ApiProperty({ type: String, description: 'Session status' })
  @Expose()
  status: string;

  @ApiProperty({ type: Date, description: 'Session start time' })
  @Expose()
  startAt: Date;

  @ApiPropertyOptional({
    type: Date,
    description: 'Session end time',
    nullable: true,
  })
  @Expose()
  endAt: Date | null;
}

@Exclude()
class OrderItemProductResponseDto {
  @ApiProperty({ type: String, description: 'Product ID' })
  @Expose()
  id: string;

  @ApiProperty({ type: String, description: 'Product name' })
  @Expose()
  name: string;

  @ApiPropertyOptional({
    type: String,
    description: 'Product image URL',
    nullable: true,
  })
  @Expose()
  imageUrl: string | null;
}

@Exclude()
class OrderItemResponseDto {
  @ApiProperty({ type: String, description: 'Order item ID' })
  @Expose()
  id: string;

  @ApiProperty({ type: Number, description: 'Quantity' })
  @Expose()
  quantity: number;

  @ApiProperty({ type: Number, description: 'Unit price' })
  @Expose()
  unitPrice: number;

  @ApiProperty({ type: Number, description: 'Subtotal' })
  @Expose()
  subtotal: number;

  @ApiProperty({ type: String, description: 'Item status' })
  @Expose()
  status: string;

  @ApiPropertyOptional({
    type: String,
    description: 'Item note',
    nullable: true,
  })
  @Expose()
  note: string | null;

  @ApiProperty({
    type: () => OrderItemProductResponseDto,
    description: 'Product details',
  })
  @Expose()
  @Type(() => OrderItemProductResponseDto)
  product: OrderItemProductResponseDto;
}

@Exclude()
export class OrderDetailedResponseDto {
  @ApiProperty({ type: String, description: 'Order ID' })
  @Expose()
  id: string;

  @ApiProperty({ enum: OrderStatus, description: 'Order status' })
  @Expose()
  status: OrderStatus;

  @ApiPropertyOptional({
    type: String,
    description: 'Order note',
    nullable: true,
  })
  @Expose()
  note: string | null;

  @ApiProperty({ type: Number, description: 'Subtotal amount before taxes' })
  @Expose()
  subtotalAmount: number;

  @ApiProperty({ type: Number, description: 'Total amount including taxes' })
  @Expose()
  totalAmount: number;

  @ApiProperty({ type: Date, description: 'Created at' })
  @Expose()
  createdAt: Date;

  @ApiProperty({ type: Date, description: 'Updated at' })
  @Expose()
  updatedAt: Date;

  @ApiPropertyOptional({
    type: () => OrderUserResponseDto,
    description: 'User who created the order',
    nullable: true,
  })
  @Expose()
  @Type(() => OrderUserResponseDto)
  user: OrderUserResponseDto | null;

  @ApiProperty({
    type: () => OrderTableResponseDto,
    description: 'Table associated with order',
  })
  @Expose()
  @Type(() => OrderTableResponseDto)
  table: OrderTableResponseDto;

  @ApiProperty({
    type: () => OrderSessionResponseDto,
    description: 'Session associated with order',
  })
  @Expose()
  @Type(() => OrderSessionResponseDto)
  session: OrderSessionResponseDto;

  @ApiPropertyOptional({
    type: () => [OrderItemResponseDto],
    description: 'Order items',
    nullable: true,
  })
  @Expose()
  @Type(() => OrderItemResponseDto)
  orderItems: OrderItemResponseDto[] | null;
}
