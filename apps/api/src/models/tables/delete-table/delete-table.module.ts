import { Module } from '@nestjs/common';
import { DeleteTableService } from './delete-table.service';

@Module({
  providers: [DeleteTableService],
  exports: [DeleteTableService],
})
export class DeleteTableModule {}
