import { IsValidCategoryName } from '../decorators/is-valid-name.decorator';
import { IsValidCategoryDescription } from '../decorators/is-valid-description.decorator';
import { IsOptional } from 'class-validator';

export class UpdateCategoryDto {
  @IsOptional()
  @IsValidCategoryName()
  name?: string;

  @IsOptional()
  @IsValidCategoryDescription()
  description?: string;

  // @IsOptional()
  // @IsValidSlug()
  // slug?: string;
}
