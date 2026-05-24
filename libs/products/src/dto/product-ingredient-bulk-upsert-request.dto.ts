import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  ArrayNotEmpty,
  IsArray,
  IsNotEmpty,
  IsNumber,
  IsUUID,
  Min,
  ValidateNested,
} from 'class-validator';

export class ProductIngredientBulkUpsertItemDto {
  @ApiProperty({
    type: String,
    description: 'Ingredient ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsNotEmpty()
  @IsUUID()
  ingredientId: string;

  @ApiProperty({
    type: Number,
    description: 'Quantity of ingredient needed per product unit',
    example: 0.5,
    minimum: 0,
  })
  @IsNotEmpty()
  @IsNumber()
  @Min(0)
  quantity: number;
}

export class ProductIngredientBulkUpsertRequestDto {
  @ApiProperty({
    type: [ProductIngredientBulkUpsertItemDto],
    description: 'List of ingredients to associate with the product.',
  })
  @IsArray()
  @ArrayNotEmpty()
  @ValidateNested({ each: true })
  @Type(() => ProductIngredientBulkUpsertItemDto)
  ingredients: ProductIngredientBulkUpsertItemDto[];
}
