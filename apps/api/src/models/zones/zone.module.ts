import { Global, Module } from '@nestjs/common';
import { ZoneController } from './zone.controller';
import { ZoneRepository } from './repositories/zone-repository.abstract';
import { PrismaZoneRepository } from './repositories/prisma-zone-repository';
import { GetZonesService } from '@posy/zones/features/get-zones/get-zones.service';
import { CreateZoneService } from '@posy/zones/features/create-zone/create-zone.service';
import { UpdateZoneService } from '@posy/zones/features/update-zone/update-zone.service';
import { DeleteZoneService } from '@posy/zones/features/delete-zone/delete-zone.service';

@Global()
@Module({
  providers: [
    {
      provide: ZoneRepository,
      useClass: PrismaZoneRepository,
    },
    GetZonesService,
    CreateZoneService,
    UpdateZoneService,
    DeleteZoneService,
  ],
  controllers: [ZoneController],
  exports: [ZoneRepository],
})
export class ZoneModule {}
