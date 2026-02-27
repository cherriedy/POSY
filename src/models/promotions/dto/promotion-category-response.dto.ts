import { ApiProperty } from '@nestjs/swagger';
import { Exclude, Expose, Type } from 'class-transformer';
import { PromotionPreviewResponseDto } from './promotion-preview-response.dto';
import { CategoryPreviewResponseDto } from '../../categories/dto';
import { FloorPreviewResponseDto } from 'src/models/floors/dto';
import { ZonePreviewResponseDto } from 'src/models/zones/dto';

@Exclude()
export class PromotionCategoryPreviewResponseDto {
  @ApiProperty({
    type: () => CategoryPreviewResponseDto,
    description: 'Category preview',
  })
  @Expose()
  @Type(() => CategoryPreviewResponseDto)
  category: CategoryPreviewResponseDto;

  @ApiProperty({
    type: () => FloorPreviewResponseDto,
    description: 'Floor preview',
  })
  @Expose()
  @Type(() => FloorPreviewResponseDto)
  floor: FloorPreviewResponseDto;

  @ApiProperty({
    type: () => ZonePreviewResponseDto,
    description: 'Zone preview',
  })
  @Expose()
  @Type(() => ZonePreviewResponseDto)
  zone: ZonePreviewResponseDto;
}
