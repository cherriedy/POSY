import { Module } from '@nestjs/common';
import { RemoveProductIngredientService } from './remove-product-ingredient.service';

@Module({
  providers: [RemoveProductIngredientService],
  exports: [RemoveProductIngredientService],
})
export class RemoveProductIngredientModule {}
