import { Module } from '@nestjs/common';
import { GetProductIngredientsService } from './get-product-ingredients.service';

@Module({
  providers: [GetProductIngredientsService],
  exports: [GetProductIngredientsService],
})
export class GetProductIngredientsModule {}
