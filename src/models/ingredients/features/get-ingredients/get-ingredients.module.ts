import { Module } from '@nestjs/common';
import { GetIngredientsService } from './get-ingredients.service';

@Module({
  providers: [GetIngredientsService],
  exports: [GetIngredientsService],
})
export class GetIngredientsModule {}
