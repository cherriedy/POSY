import { Injectable } from '@nestjs/common';
import { TableRepository } from '../../shared/repositories/table-repository.abstract';
import { Page } from '@posy/shared';
import { Table } from '../../shared/entities/table';
import { TableNotFoundException } from '../../shared/errors/table-not-found.exception';
import { TableQueryParams } from '../../shared/interfaces/table-query-params.interface';

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
