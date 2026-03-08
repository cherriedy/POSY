import { Injectable } from '@nestjs/common';
import { TableRepository } from '../repositories';
import { Table } from '../types';
import { ZoneRepository } from 'src/models/zones/repositories';
import { TableNotFoundException } from '../exceptions';
import { ZoneNotFoundException } from 'src/models/zones/exceptions';
import { DuplicateEntryException } from 'src/common/exceptions';

@Injectable()
export class UpdateTableService {
  constructor(
    private readonly tableRepository: TableRepository,
    private readonly zoneRepository: ZoneRepository,
  ) {}

  async updateTable(id: string, dto: Partial<Table>): Promise<Table> {
    // Check table
    const existingTable = await this.tableRepository.findById(id);
    if (!existingTable) {
      throw new TableNotFoundException(id);
    }

    // Check zone
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
