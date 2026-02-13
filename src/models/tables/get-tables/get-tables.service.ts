import { Injectable } from '@nestjs/common';
import { TableRepository } from '../repositories';
import { Page } from '../../../common/interfaces';
import { Table } from '../types';
import { TableNotFoundException } from '../exceptions';
import { TableQueryParams } from '../interfaces';

@Injectable()
export class GetTablesService {
  constructor(private readonly tableRepository: TableRepository) {}

  async getAll(params: TableQueryParams): Promise<Page<Table>> {
    return this.tableRepository.getAllPaged(params);
  }

  async getTableById(id: string): Promise<Table> {
    const table = await this.tableRepository.findById(id);
    if (!table) {
      throw new TableNotFoundException(id);
    }
    return table;
  }
}
