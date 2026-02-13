import { Injectable } from '@nestjs/common';
import { TableRepository } from '../repositories';
import { Table } from '../types';

@Injectable()
export class UpdateTableService {
  constructor(private readonly tableRepository: TableRepository) {}

  async updateTable(id: string, table: Partial<Table>): Promise<Table> {
    return await this.tableRepository.update(id, table);
  }
}
