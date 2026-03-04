import { Global, Module } from '@nestjs/common';
import { UnitController } from './unit.controller';
import { UnitRepository, UnitRepositoryImpl } from './repositories';
import { CreateUnitModule } from './create-unit';
import { GetUnitsModule } from './get-units';
import { UpdateUnitModule } from './update-unit';
import { DeleteUnitModule } from './delete-unit';

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
