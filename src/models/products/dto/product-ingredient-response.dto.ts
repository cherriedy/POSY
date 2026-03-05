import { Expose, Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { UnitResponseDto } from 'src/models/units';

class IngredientPreview {
  @Expose()
  @ApiProperty()
  id: string;

  @Expose()
  @ApiProperty()
  name: string;

  @Expose()
  @Type(() => UnitResponseDto)
  @ApiProperty({ type: UnitResponseDto })
  unit: UnitResponseDto;
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
