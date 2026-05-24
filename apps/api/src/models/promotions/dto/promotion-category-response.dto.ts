import { ApiProperty } from '@nestjs/swagger';
import { Exclude, Expose, Type } from 'class-transformer';
import { CategoryPreviewResponseDto } from '@posy/categories/shared/dto/category-preview-response.dto';

@Exclude()
export class PromotionCategoryPreviewResponseDto {
  @ApiProperty({
    type: () => CategoryPreviewResponseDto,
    description: 'Category preview',
  })
  @Expose()
  @Type(() => CategoryPreviewResponseDto)
  category: CategoryPreviewResponseDto;
}
