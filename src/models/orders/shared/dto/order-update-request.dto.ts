import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Min,
  ValidateNested,
} from 'class-validator';

class AddItemDto {
  @ApiProperty({ example: 'PROD-001' })
  @IsString()
  @IsNotEmpty()
  productId: string;

  @ApiProperty({ example: 2, minimum: 1 })
  @IsInt()
  @Min(1)
  quantity: number;

  @ApiProperty({ example: 'Extra spicy' })
  @IsString()
  @IsOptional()
  note?: string;
}

class UpdateItemDto {
  @ApiProperty({ example: '1' })
  @IsString()
  @IsNotEmpty()
  orderItemId: string;

  @ApiProperty({ example: 3, minimum: 1 })
  @IsInt()
  @Min(1)
  @IsOptional()
  quantity?: number;

  @ApiProperty({ example: 'Not too spicy' })
  @IsString()
  @IsOptional()
  note?: string;
}

class RemoveItemDto {
  @ApiProperty({ example: '1' })
  @IsString()
  @IsNotEmpty()
  orderItemId: string;
}

export class OrderUpdateRequestDto {
  @ApiProperty({
    description: 'A list of items to add to the order.',
    type: [AddItemDto],
    required: false,
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => AddItemDto)
  @IsOptional()
  add?: AddItemDto[];

  @ApiProperty({
    description: 'A list of items to update in the order.',
    type: [UpdateItemDto],
    required: false,
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => UpdateItemDto)
  @IsOptional()
  update?: UpdateItemDto[];

  @ApiProperty({
    description: 'A list of item IDs to remove from the order.',
    type: [RemoveItemDto],
    required: false,
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => RemoveItemDto)
  @IsOptional()
  remove?: RemoveItemDto[];

  @ApiProperty({
    description: 'An optional note for the order.',
    example: 'Please deliver to table 10.',
    required: false,
  })
  @IsString()
  @IsOptional()
  note?: string;
}
