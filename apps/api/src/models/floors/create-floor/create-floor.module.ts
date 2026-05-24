import { Module } from '@nestjs/common';
import { CreateFloorService } from './create-floor.service';

@Module({
  providers: [CreateFloorService],
  exports: [CreateFloorService],
})
export class CreateFloorModule {}
