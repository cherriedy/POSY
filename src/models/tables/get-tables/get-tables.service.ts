import { Injectable } from '@nestjs/common';
import { TableRepository } from '../repositories/table.repository-abstract';
import { Page } from '../../../common/interfaces/page.interface';
import { Table } from '../types/table.class';
import { TableNotFoundException } from '../exceptions/table-not-found.exception';
import { TableQueryParams } from '../interfaces/table-query-params.interface';

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
