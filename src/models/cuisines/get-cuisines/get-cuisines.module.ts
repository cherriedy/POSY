import { Module } from '@nestjs/common';
import { GetCuisinesService } from './get-cuisines.service';

@Module({
  providers: [GetCuisinesService],
  exports: [GetCuisinesService],
})
export class GetCuisinesModule {}
