import { Module } from '@nestjs/common';
import { CreateIngredientService } from './create-ingredient.service';

@Module({
  providers: [CreateIngredientService],
  exports: [CreateIngredientService],
})
export class CreateIngredientModule {}
