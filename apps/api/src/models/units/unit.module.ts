import { Global, Module } from '@nestjs/common';
import { UnitController } from './unit.controller';
import { UnitRepository } from './repositories/unit-repository.abstract';
import { UnitRepositoryImpl } from './repositories/unit-repository';
import { CreateUnitModule } from './create-unit/create-unit.module';
import { GetUnitsModule } from './get-units/get-units.module';
import { UpdateUnitModule } from './update-unit/update-unit.module';
import { DeleteUnitModule } from './delete-unit/delete-unit.module';

@Global()
@Module({
  providers: [{ provide: UnitRepository, useClass: UnitRepositoryImpl }],
  exports: [UnitRepository],
  imports: [
    CreateUnitModule,
    GetUnitsModule,
    UpdateUnitModule,
    DeleteUnitModule,
  ],
  controllers: [UnitController],
})
export class UnitModule {}
