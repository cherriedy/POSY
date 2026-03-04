import { Module } from '@nestjs/common';
import { GetUnitsService } from './get-units.service';

@Module({
  providers: [GetUnitsService],
  exports: [GetUnitsService],
})
export class GetUnitsModule {}
