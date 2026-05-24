import { IsBoolean } from 'class-validator';
import { IsValidCategoryName } from '../decorators/is-valid-name.decorator';
import { IsValidCategoryDescription } from '../decorators/is-valid-description.decorator';
import { IsValidSlug } from '../../../../common/decorators/is-valid-slug.decorator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateCategoryDto {
  @ApiProperty({
    type: String,
    description: 'Category name',
    example: 'Beverages',
  })
  @IsValidCategoryName()
  name: string;

  @ApiPropertyOptional({
    type: String,
    description: 'Category description',
    example: 'All kinds of drinks',
    nullable: true,
  })
  @IsValidCategoryDescription()
  description?: string;

  @ApiPropertyOptional({
    type: String,
    description: 'Category slug',
    example: 'beverages',
    nullable: true,
  })
  @IsValidSlug()
  slug?: string;

  @ApiPropertyOptional({
    type: Boolean,
    description: 'Is category active',
    example: true,
  })
  @IsBoolean()
  isActive?: boolean = true;
}
