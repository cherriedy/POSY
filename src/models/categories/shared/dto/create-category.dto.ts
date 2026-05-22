import { IsBoolean } from 'class-validator';
import { IsValidCategoryName } from '../decorators/is-valid-name.decorator';
import { IsValidCategoryDescription } from '../decorators/is-valid-description.decorator';

export class CreateCategoryDto {
  @IsValidCategoryName()
  name: string;

  @IsValidCategoryDescription()
  description?: string;

  // @IsValidSlug()
  // slug?: string;

  @IsBoolean()
  isActive?: boolean = true;
}
