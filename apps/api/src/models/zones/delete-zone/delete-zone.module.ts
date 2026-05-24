import { Module } from '@nestjs/common';
import { DeleteZoneService } from './delete-zone.service';

@Module({
  providers: [DeleteZoneService],
  exports: [DeleteZoneService],
})
export class DeleteZoneModule {}
