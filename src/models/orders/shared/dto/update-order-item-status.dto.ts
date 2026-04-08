import { IsEnum, IsOptional, IsString } from 'class-validator';
import { OrderItemStatus } from '../enums';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateOrderItemStatusDto {
  @ApiProperty({
    enum: OrderItemStatus,
    description: 'New status for the order item',
  })
  @IsEnum(OrderItemStatus)
  status: OrderItemStatus;

  @ApiPropertyOptional({
    type: String,
    description: 'Optional note about the status change',
    nullable: true,
  })
  @IsOptional()
  @IsString()
  note?: string | null;
}
