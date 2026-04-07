import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  ArrayMinSize,
  IsArray,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  Min,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

export class OrderItemCreateDto {
  @ApiProperty({
    type: String,
    description: 'Product ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsNotEmpty()
  @IsUUID('4')
  productId: string;

  @ApiProperty({
    type: Number,
    description: 'Quantity',
    example: 2,
    minimum: 1,
  })
  @IsInt()
  @Min(1)
  quantity: number;

  @ApiPropertyOptional({
    type: String,
    description: 'Optional note for this item',
    example: 'Extra sauce',
    nullable: true,
  })
  @IsOptional()
  @IsString()
  note: string | null;
}

export class OrderCreateRequestDto {
  @ApiPropertyOptional({
    type: String,
    description: 'Table ID. Required for staff-initiated orders.',
    example: 'a1b2c3d4-e5f6-7890-1234-567890abcdef',
  })
  @IsOptional()
  @IsUUID()
  tableId?: string;

  @ApiProperty({
    type: [OrderItemCreateDto],
    description: 'List of order items',
  })
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => OrderItemCreateDto)
  items: OrderItemCreateDto[];

  @ApiPropertyOptional({
    type: String,
    description: 'Optional note for the entire order',
    example: 'No spicy food please',
    nullable: true,
  })
  @IsOptional()
  @IsString()
  note: string | null;
}
