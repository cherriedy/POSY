import { Module } from '@nestjs/common';
import { DeleteUnitService } from './delete-unit.service';

@Module({
  providers: [DeleteUnitService],
  exports: [DeleteUnitService],
})
export class DeleteUnitModule {}
