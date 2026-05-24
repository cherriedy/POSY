import { Injectable } from '@nestjs/common';
import { TableRepository } from '../../shared/repositories/table-repository.abstract';
import { Table } from '../../shared/entities/table';
import { ZoneRepository } from 'src/models/zones/repositories/zone-repository.abstract';
import { RelatedRecordNotFoundError } from '@posy/shared';

@Injectable()
export class CreateTableService {
  constructor(
    private readonly tableRepository: TableRepository,
    private readonly zoneRepository: ZoneRepository,
  ) {}

  async createTable(table: Table): Promise<Table> {
    if (table.zoneId) {
      const zone = await this.zoneRepository.findById(table.zoneId);
      if (!zone) {
        throw new RelatedRecordNotFoundError(
          `Zone with id ${table.zoneId} not found`,
        );
      }
    }
    return await this.tableRepository.create(table);
  }
}
