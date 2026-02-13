import { ApiProperty } from '@nestjs/swagger';
import { Exclude, Expose } from 'class-transformer';

@Exclude()
export class ProductCategoryResponseDto {
  @ApiProperty({
    type: String,
    description: 'Category ID',
    example: 'c1a2b3d4-5678-90ab-cdef-1234567890ab',
  })
  @Expose()
  id: string;

  @ApiProperty({
    type: String,
    description: 'Category name',
    example: 'Beverages',
  })
  @Expose()
  name: string;

  @ApiProperty({
    type: String,
    description: 'Category slug',
    example: 'beverages',
  })
  @Expose()
  slug: string;
}
