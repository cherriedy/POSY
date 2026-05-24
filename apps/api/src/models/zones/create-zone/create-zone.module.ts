import { Module } from '@nestjs/common';
import { CreateZoneService } from './create-zone.service';

@Module({
  providers: [CreateZoneService],
  exports: [CreateZoneService],
})
export class CreateZoneModule {}
