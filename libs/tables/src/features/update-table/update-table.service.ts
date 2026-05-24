import { Injectable } from '@nestjs/common';
import { TableRepository } from '../../shared/repositories/table-repository.abstract';
import { Table } from '../../shared/entities/table';
import { ZoneRepository } from 'src/models/zones/repositories/zone-repository.abstract';
import { TableNotFoundException } from '../../shared/errors/table-not-found.exception';
import { ZoneNotFoundException } from 'src/models/zones/exceptions/zone-not-found.exception';
import { DuplicateEntryError } from '@posy/shared';

@Injectable()
export class UpdateTableService {
  constructor(
    private readonly tableRepository: TableRepository,
    private readonly zoneRepository: ZoneRepository,
  ) {}

  async updateTable(id: string, dto: Partial<Table>): Promise<Table> {
    const existingTable = await this.tableRepository.findById(id);
    if (!existingTable) {
      throw new TableNotFoundException(id);
    }

    if ('zoneId' in dto) {
      const zoneId = dto.zoneId;

      if (zoneId) {
        const zone = await this.zoneRepository.findById(zoneId);
        if (!zone) {
          throw new ZoneNotFoundException(zoneId);
        }
      }
    }

    return this.tableRepository.update(id, dto);
  }
}
