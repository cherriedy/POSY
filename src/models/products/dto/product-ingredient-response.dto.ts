import { Expose, Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

class IngredientPreview {
  @Expose()
  @ApiProperty()
  id: string;

  @Expose()
  @ApiProperty()
  name: string;

  @Expose()
  @ApiProperty()
  unitCost: number;
}

export class ProductIngredientResponseDto {
  @Expose()
  @ApiProperty()
  id: string;

  @Expose()
  @ApiProperty()
  quantity: number;

  @Expose()
  @Type(() => IngredientPreview)
  @ApiProperty({ type: IngredientPreview })
  ingredient: IngredientPreview;

  @Expose()
  @ApiProperty()
  createdAt: Date;

  @Expose()
  @ApiProperty()
  updatedAt: Date;
}
