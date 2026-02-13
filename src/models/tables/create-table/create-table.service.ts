import { Injectable } from '@nestjs/common';
import { TableRepository } from '../repositories';
import { Table } from '../types';

@Injectable()
export class CreateTableService {
  constructor(private readonly tableRepository: TableRepository) {}
  /**
   * Creates a new table using the provided table data.
   *
   * This method delegates the creation logic to the TableRepository, which handles
   * the actual persistence of the table entity. It returns the created table object.
   *
   * @param table - The table entity to be created. Should contain all required fields for creation.
   * @returns A promise that resolves to the created Table object.
   * @throws DuplicateEntryException if a table with a unique field already exists (from repository layer).
   * @throws RelatedRecordNotFoundException if a related record is not found (from repository layer).
   */
  async createTable(table: Table): Promise<Table> {
    return await this.tableRepository.create(table);
  }
}
