import { Module } from '@nestjs/common';
import { UpdateUnitService } from './update-unit.service';

@Module({
  providers: [UpdateUnitService],
  exports: [UpdateUnitService],
})
export class UpdateUnitModule {}
