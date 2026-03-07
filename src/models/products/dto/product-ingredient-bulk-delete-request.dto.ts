import { ApiProperty } from '@nestjs/swagger';
import { ArrayNotEmpty, IsArray, IsUUID } from 'class-validator';

export class ProductIngredientBulkDeleteRequestDto {
  @ApiProperty({
    type: [String],
    description: 'List of ingredient IDs to remove from the product.',
    example: [
      '123e4567-e89b-12d3-a456-426614174000',
      '223e4567-e89b-12d3-a456-426614174001',
    ],
  })
  @IsArray()
  @ArrayNotEmpty()
  @IsUUID('4', { each: true })
  ingredientIds: string[];
}
