import { Global, Module } from '@nestjs/common';
import { FloorController } from './floor.controller';
import { PrismaModule } from 'src/providers/prisma/prisma.module';
import { CreateFloorModule } from './create-floor/create-floor.module';
import { UpdateFloorModule } from './update-floor/update-floor.module';
import { DeleteFloorModule } from './delete-floor/delete-floor.module';
import { FloorRepository, FloorRepositoryImpl } from './repositories';
import { GetFloorsModule } from './get-floors/get-floors.module';

@Global()
@Module({
  providers: [
    {
      provide: FloorRepository,
      useClass: FloorRepositoryImpl,
    },
  ],
  imports: [
    PrismaModule,
    CreateFloorModule,
    UpdateFloorModule,
    DeleteFloorModule,
    GetFloorsModule,
  ],
  controllers: [FloorController],
  exports: [FloorRepository],
})
export class FloorModule {}
