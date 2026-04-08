import { IsBoolean } from 'class-validator';
import { IsValidCategoryDescription, IsValidCategoryName } from '../decorators';

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
