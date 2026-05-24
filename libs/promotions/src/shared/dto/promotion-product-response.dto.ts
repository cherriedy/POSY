import { ApiProperty } from '@nestjs/swagger';
import { Exclude, Expose, Type } from 'class-transformer';
import { ProductPreviewResponseDto } from '@posy/products/dto/product-preview-response.dto';

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
