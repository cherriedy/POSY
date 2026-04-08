import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Exclude, Expose, Type } from 'class-transformer';
import { OrderStatus } from '../enums';

@Exclude()
class OrderTablePreviewDto {
  @ApiProperty({ type: String, description: 'Table ID' })
  @Expose()
  id: string;

  @ApiProperty({ type: String, description: 'Table name' })
  @Expose()
  name: string;
}

@Exclude()
class OrderSessionPreviewDto {
  @ApiProperty({ type: String, description: 'Session ID' })
  @Expose()
  id: string;

  @ApiProperty({ type: String, description: 'Session status' })
  @Expose()
  status: string;
}

@Exclude()
export class OrderPreviewResponseDto {
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

  @ApiProperty({
    type: () => OrderTablePreviewDto,
    description: 'Table associated with order',
  })
  @Expose()
  @Type(() => OrderTablePreviewDto)
  table: OrderTablePreviewDto;

  @ApiProperty({
    type: () => OrderSessionPreviewDto,
    description: 'Session associated with order',
  })
  @Expose()
  @Type(() => OrderSessionPreviewDto)
  session: OrderSessionPreviewDto;
}
