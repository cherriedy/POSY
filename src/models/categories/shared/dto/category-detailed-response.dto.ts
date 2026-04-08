import { CategoryPreviewResponseDto } from './category-preview-response.dto';
import { Exclude, Expose } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

@Exclude()
export class CategoryDetailedResponseDto extends CategoryPreviewResponseDto {
  @Expose()
  @ApiProperty({
    description: 'Detailed description of the category',
    type: String,
    example: 'All kinds of drinks including soft drinks, juices, and water.',
  })
  description: string;
}
