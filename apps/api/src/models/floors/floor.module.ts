import { Global, Module } from '@nestjs/common';
import { FloorController } from './floor.controller';
import { FloorRepository } from '@posy/floors/shared/repositories/floor-repository.abstract';
import { PrismaFloorRepository } from '@posy/floors/shared/repositories/prisma-floor-repository';
import { GetFloorsService } from '@posy/floors/features/get-floors/get-floors.service';
import { CreateFloorService } from '@posy/floors/features/create-floor/create-floor.service';
import { UpdateFloorService } from '@posy/floors/features/update-floor/update-floor.service';
import { DeleteFloorService } from '@posy/floors/features/delete-floor/delete-floor.service';

@Global()
@Module({
  providers: [
    {
      provide: FloorRepository,
      useClass: PrismaFloorRepository,
    },
    GetFloorsService,
    CreateFloorService,
    UpdateFloorService,
    DeleteFloorService,
  ],
  controllers: [FloorController],
  exports: [FloorRepository],
})
export class FloorModule {}
