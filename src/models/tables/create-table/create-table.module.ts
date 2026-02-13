import { Module } from '@nestjs/common';
import { CreateTableService } from './create-table.service';

@Module({
  providers: [CreateTableService],
  exports: [CreateTableService],
})
export class CreateTableModule {}
