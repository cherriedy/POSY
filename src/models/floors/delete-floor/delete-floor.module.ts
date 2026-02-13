import { Module } from '@nestjs/common';
import { DeleteFloorService } from './delete-floor.service';

@Module({
  providers: [DeleteFloorService],
  exports: [DeleteFloorService],
})
export class DeleteFloorModule {}
