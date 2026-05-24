import { Module } from '@nestjs/common';
import { UpdateFloorService } from './update-floor.service';

@Module({
  providers: [UpdateFloorService],
  exports: [UpdateFloorService],
})
export class UpdateFloorModule {}
