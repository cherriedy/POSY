import { Module } from '@nestjs/common';
import { DeleteIngredientService } from './delete-ingredient.service';

@Module({
  providers: [DeleteIngredientService],
  exports: [DeleteIngredientService],
})
export class DeleteIngredientModule {}
