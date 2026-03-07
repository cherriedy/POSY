import { Injectable } from '@nestjs/common';
import { TableRepository } from '../repositories';
import { Table } from '../types';
import { ZoneRepository } from 'src/models/zones/repositories';
import { RelatedRecordNotFoundException } from 'src/common/exceptions';

@Injectable()
export class CreateTableService {
  constructor(
    private readonly tableRepository: TableRepository,
    private readonly zoneRepository: ZoneRepository,
  ) {}
  /**
   * Creates a new table using the provided table data.
   *
   * This method delegates the creation logic to the TableRepository, which handles
   * the actual entities of the table entity. It returns the created table object.
   *
   * @param table - The table entity to be created. Should contain all required fields for creation.
   * @returns A promise that resolves to the created Table object.
   * @throws DuplicateEntryException if a table with a unique field already exists (from repository layer).
   * @throws RelatedRecordNotFoundException if a related record is not found (from repository layer).
   */
  async createTable(table: Table): Promise<Table> {
    if (table.zoneId) {
      const zone = await this.zoneRepository.findById(table.zoneId);
      if (!zone) {
        throw new RelatedRecordNotFoundException(
          `Zone with id ${table.zoneId} not found`,
        );
      }
    }
    return await this.tableRepository.create(table);
  }
}
