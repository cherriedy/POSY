import { Module } from '@nestjs/common';
import { CreateTableService } from './create-table.service';
import { ZoneModule } from 'src/models/zones/zone.module';
import { FloorModule } from '../../floors/floor.module';

@Module({
  imports: [ZoneModule, FloorModule],
  providers: [CreateTableService],
  exports: [CreateTableService],
})
export class CreateTableModule {}
