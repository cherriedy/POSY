import { ApiProperty } from '@nestjs/swagger';
import { Exclude, Expose, Type } from 'class-transformer';
import { StockStatus } from '../enum';

@Exclude()
class IngredientOverviewMetaDto {
  @ApiProperty({
    type: String,
    description: 'Target date',
    example: '2026-04-11',
  })
  @Expose()
  target_date: string;

  @ApiProperty({
    type: Number,
    description: 'Total number of ingredients',
    example: 85,
  })
  @Expose()
  total_ingredients: number;

  @ApiProperty({
    type: Number,
    description: 'Count of dangerous ingredients',
    example: 3,
  })
  @Expose()
  danger_count: number;

  @ApiProperty({
    type: Number,
    description: 'Count of warning ingredients',
    example: 5,
  })
  @Expose()
  warning_count: number;
}

@Exclude()
class IngredientOverviewItemDto {
  @ApiProperty({
    type: String,
    description: 'Ingredient id',
    example: 'uuid-1',
  })
  @Expose()
  ingredient_id: string;

  @ApiProperty({
    type: String,
    description: 'Ingredient name',
    example: 'Thịt bò Kobe',
  })
  @Expose()
  name: string;

  @ApiProperty({
    type: String,
    description: 'Unit',
    example: 'kg',
  })
  @Expose()
  unit: string;

  @ApiProperty({
    type: Number,
    description: 'Current stock',
    example: 12.5,
  })
  @Expose()
  current_stock: number;

  @ApiProperty({
    type: Number,
    description: 'Predicted usage',
    example: 15.0,
  })
  @Expose()
  predicted_usage: number;

  @ApiProperty({
    type: Number,
    description: 'Upper bound',
    example: 18.0,
  })
  @Expose()
  upper_bound: number;

  @ApiProperty({
    type: String,
    description: 'Stock status',
    example: StockStatus.DANGER,
    enum: StockStatus,
  })
  @Expose()
  stock_status: StockStatus;
}

@Exclude()
export class IngredientOverviewResponseDto {
  @ApiProperty({
    type: () => IngredientOverviewMetaDto,
    description: 'Response meta',
  })
  @Expose()
  @Type(() => IngredientOverviewMetaDto)
  meta: IngredientOverviewMetaDto;

  @ApiProperty({
    type: () => IngredientOverviewItemDto,
    isArray: true,
    description: 'List of ingredient overviews',
  })
  @Expose()
  @Type(() => IngredientOverviewItemDto)
  items: IngredientOverviewItemDto[];
}
