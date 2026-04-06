import { PartialType } from '@nestjs/swagger';
import { IngredientCreateUpdateDto } from './ingredient-create-update.dto';

export class IngredientUpdateRequestDto extends PartialType(
  IngredientCreateUpdateDto,
) {}
