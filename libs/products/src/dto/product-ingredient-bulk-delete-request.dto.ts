import { ApiProperty } from '@nestjs/swagger';
import {
  ArrayMaxSize,
  ArrayMinSize,
  ArrayNotEmpty,
  IsArray,
  IsUUID,
} from 'class-validator';

export class ProductIngredientBulkDeleteRequestDto {
  @ApiProperty({
    type: [String],
    description: 'Array of association IDs to remove (1-100 IDs per request)',
    example: [
      '123e4567-e89b-12d3-a456-426614174000',
      '223e4567-e89b-12d3-a456-426614174001',
    ],
  })
  @IsArray()
  @ArrayMinSize(1)
  @ArrayMaxSize(100)
  @ArrayNotEmpty()
  @IsUUID('4', { each: true })
  associationIds: string[];
}
