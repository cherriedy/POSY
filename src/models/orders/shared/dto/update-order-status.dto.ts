import { IsEnum, IsOptional, IsString } from 'class-validator';
import { OrderStatus } from '../enums';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateOrderStatusDto {
  @ApiProperty({ enum: OrderStatus, description: 'New status for the order' })
  @IsEnum(OrderStatus)
  status: OrderStatus;

  @ApiPropertyOptional({
    type: String,
    description: 'Optional internal note regarding the status change',
    example: 'Customer requested delayed delivery',
    nullable: true,
  })
  @IsOptional()
  @IsString()
  note?: string | null;
}
