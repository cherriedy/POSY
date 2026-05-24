import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';

export class ProductAttributeCuisineResponseDto {
  @ApiProperty({
    description: 'Cuisine ID',
    example: 'cuisine-1234',
  })
  @Expose()
  id: string;

  @ApiProperty({
    description: 'Cuisine name',
    example: 'Italian',
  })
  @Expose()
  name: string;

  @ApiProperty({
    description: 'Cuisine region',
    example: 'Mediterranean',
  })
  @Expose()
  region: string;
}
