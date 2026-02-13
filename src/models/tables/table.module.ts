import { Global, Module } from '@nestjs/common';
import { TableController } from './table.controller';
import { PrismaModule } from 'src/providers/prisma/prisma.module';
import { CreateTableModule } from './create-table/create-table.module';
import { UpdateTableModule } from './update-table/update-table.module';
import { DeleteTableModule } from './delete-table/delete-table.module';
import { TableRepository, TableRepositoryImpl } from './repositories';
import { GetTablesModule } from './get-tables/get-tables.module';

@Global()
@Module({
  providers: [
    {
      provide: TableRepository,
      useClass: TableRepositoryImpl,
    },
  ],
  imports: [
    PrismaModule,
    CreateTableModule,
    UpdateTableModule,
    DeleteTableModule,
    GetTablesModule,
  ],
  controllers: [TableController],
  exports: [TableRepository],
})
export class TableModule {}
