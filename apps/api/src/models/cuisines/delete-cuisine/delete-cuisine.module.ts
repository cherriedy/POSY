import { Module } from '@nestjs/common';
import { DeleteCuisineService } from './delete-cuisine.service';

@Module({
  providers: [DeleteCuisineService],
  exports: [DeleteCuisineService],
})
export class DeleteCuisineModule {}
