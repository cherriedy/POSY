import { Global, Module } from '@nestjs/common';
import { ZoneController } from './zone.controller';
import { PrismaModule } from 'src/providers/prisma/prisma.module';
import { CreateZoneModule } from './create-zone/create-zone.module';
import { UpdateZoneModule } from './update-zone/update-zone.module';
import { DeleteZoneModule } from './delete-zone/delete-zone.module';
import { ZoneRepository, ZoneRepositoryImpl } from './repositories';
import { GetZonesModule } from './get-zones/get-zones.module';

@Global()
@Module({
  providers: [
    {
      provide: ZoneRepository,
      useClass: ZoneRepositoryImpl,
    },
  ],
  imports: [
    PrismaModule,
    CreateZoneModule,
    UpdateZoneModule,
    DeleteZoneModule,
    GetZonesModule,
  ],
  controllers: [ZoneController],
  exports: [ZoneRepository],
})
export class ZoneModule {}
