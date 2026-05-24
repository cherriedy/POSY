import { Module } from '@nestjs/common';
import { CreateCuisineService } from './create-cuisine.service';

@Module({
  providers: [CreateCuisineService],
  exports: [CreateCuisineService],
})
export class CreateCuisineModule {}
