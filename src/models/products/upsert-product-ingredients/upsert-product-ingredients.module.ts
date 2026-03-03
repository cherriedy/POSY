import { Module } from '@nestjs/common';
import { UpsertProductIngredientsService } from './upsert-product-ingredients.service';

@Module({
  providers: [UpsertProductIngredientsService],
  exports: [UpsertProductIngredientsService],
})
export class UpsertProductIngredientsModule {}
