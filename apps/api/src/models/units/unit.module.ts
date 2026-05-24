import { Global, Module } from '@nestjs/common';
import { UnitController } from './unit.controller';
import { UnitRepository } from '@posy/units/shared/repositories/unit-repository.abstract';
import { UnitRepositoryImpl } from '@posy/units/shared/repositories/prisma-unit-repository';
import { CreateUnitService } from '@posy/units/features/create-unit/create-unit.service';
import { GetUnitsService } from '@posy/units/features/get-units/get-units.service';
import { UpdateUnitService } from '@posy/units/features/update-unit/update-unit.service';
import { DeleteUnitService } from '@posy/units/features/delete-unit/delete-unit.service';

@Global()
@Module({
  providers: [
    { provide: UnitRepository, useClass: UnitRepositoryImpl },
    CreateUnitService,
    GetUnitsService,
    UpdateUnitService,
    DeleteUnitService,
  ],
  exports: [UnitRepository],
  controllers: [UnitController],
})
export class UnitModule {}
