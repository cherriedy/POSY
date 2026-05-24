import { Module } from '@nestjs/common';
import { UpdateTableService } from './update-table.service';

@Module({
  providers: [UpdateTableService],
  exports: [UpdateTableService],
})
export class UpdateTableModule {}
