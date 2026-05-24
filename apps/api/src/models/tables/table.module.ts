import { Global, Module } from '@nestjs/common';
import { TableController } from './table.controller';
import { TableRepository } from './repositories/table-repository.abstract';
import { PrismaTableRepository } from './repositories/prisma-table-repository';
import { GetTablesService } from '@posy/tables/features/get-tables/get-tables.service';
import { CreateTableService } from '@posy/tables/features/create-table/create-table.service';
import { UpdateTableService } from '@posy/tables/features/update-table/update-table.service';
import { DeleteTableService } from '@posy/tables/features/delete-table/delete-table.service';

@Global()
@Module({
  providers: [
    {
      provide: TableRepository,
      useClass: PrismaTableRepository,
    },
    GetTablesService,
    CreateTableService,
    UpdateTableService,
    DeleteTableService,
  ],
  controllers: [TableController],
  exports: [TableRepository],
})
export class TableModule {}
