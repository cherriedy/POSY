import { Module } from '@nestjs/common';
import { UpdateIngredientService } from './update-ingredient.service';

@Module({
  providers: [UpdateIngredientService],
  exports: [UpdateIngredientService],
})
export class UpdateIngredientModule {}
