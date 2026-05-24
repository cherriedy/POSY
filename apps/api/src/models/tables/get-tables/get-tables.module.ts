import { Module } from '@nestjs/common';
import { GetTablesService } from './get-tables.service';

@Module({
  providers: [GetTablesService],
  exports: [GetTablesService],
})
export class GetTablesModule {}
