import { Module } from '@nestjs/common';
import { UpdateCuisineService } from './update-cuisine.service';

@Module({
  providers: [UpdateCuisineService],
  exports: [UpdateCuisineService],
})
export class UpdateCuisineModule {}
