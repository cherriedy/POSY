import { Module } from '@nestjs/common';
import { UpsertIngredientsService } from './upsert-ingredients.service';

@Module({
  providers: [UpsertIngredientsService],
  exports: [UpsertIngredientsService],
})
export class UpsertIngredientsModule {}
