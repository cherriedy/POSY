import { Module } from '@nestjs/common';
import { CreateUnitService } from './create-unit.service';

@Module({
  providers: [CreateUnitService],
  exports: [CreateUnitService],
})
export class CreateUnitModule {}
