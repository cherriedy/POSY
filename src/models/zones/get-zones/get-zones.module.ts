import { Module } from '@nestjs/common';
import { GetZonesService } from './get-zones.service';
@Module({
  providers: [GetZonesService],
  exports: [GetZonesService],
})
export class GetZonesModule {}
