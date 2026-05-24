import { IsValidCategoryName } from '../decorators/is-valid-name.decorator';
import { IsValidCategoryDescription } from '../decorators/is-valid-description.decorator';
import { IsValidSlug } from '../../../../common/decorators/is-valid-slug.decorator';
import { IsOptional } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateCategoryDto {
  @ApiPropertyOptional({
    type: String,
    description: 'Category name',
    example: 'Beverages',
  })
  @IsOptional()
  @IsValidCategoryName()
  name?: string;

  @ApiPropertyOptional({
    type: String,
    description: 'Category description',
    example: 'All kinds of drinks',
    nullable: true,
  })
  @IsOptional()
  @IsValidCategoryDescription()
  description?: string;

  @ApiPropertyOptional({
    type: String,
    description: 'Category slug',
    example: 'beverages',
    nullable: true,
  })
  @IsOptional()
  @IsValidSlug()
  slug?: string;
}
