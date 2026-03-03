import { Expose, Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

class VendorPreview {
  @Expose()
  @ApiProperty()
  id: string;

  @Expose()
  @ApiProperty()
  name: string;

  @Expose()
  @ApiProperty()
  status: string;
}

class UnitPreview {
  @Expose()
  @ApiProperty()
  id: string;

  @Expose()
  @ApiProperty()
  name: string;

  @Expose()
  @ApiProperty()
  abbreviation: string;
}

export class IngredientResponseDto {
  @Expose()
  @ApiProperty()
  id: string;

  @Expose()
  @ApiProperty()
  name: string;

  @Expose()
  @ApiProperty()
  stock: number;

  @Expose()
  @ApiProperty()
  minStock: number;

  @Expose()
  @ApiProperty()
  unitCost: number;

  @Expose()
  @ApiPropertyOptional()
  expiredAt?: Date;

  @Expose()
  @Type(() => VendorPreview)
  @ApiProperty({ type: VendorPreview })
  vendor?: VendorPreview;

  @Expose()
  @Type(() => UnitPreview)
  @ApiProperty({ type: UnitPreview })
  unit?: UnitPreview;

  @Expose()
  @ApiProperty()
  createdAt: Date;

  @Expose()
  @ApiProperty()
  updatedAt: Date;
}
