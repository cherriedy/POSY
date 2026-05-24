import { Module } from '@nestjs/common';
import { UpdateZoneService } from './update-zone.service';
@Module({
  providers: [UpdateZoneService],
  exports: [UpdateZoneService],
})
export class UpdateZoneModule {}
