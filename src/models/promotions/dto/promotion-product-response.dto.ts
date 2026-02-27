import { ApiProperty } from '@nestjs/swagger';
import { Exclude, Expose, Type } from 'class-transformer';
import { FloorPreviewResponseDto } from 'src/models/floors/dto';
import { ZonePreviewResponseDto } from 'src/models/zones/dto';
import { ProductPreviewResponseDto } from 'src/models/products/dto';

@Exclude()
export class PromotionProductPreviewResponseDto {
  @ApiProperty({
    type: () => ProductPreviewResponseDto,
    description: 'Product preview',
  })
  @Expose()
  @Type(() => ProductPreviewResponseDto)
  product: ProductPreviewResponseDto;
}
