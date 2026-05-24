import { Table } from '../entities/table';
import { BaseRepository } from '@posy/shared';
import { Page } from '@posy/shared';
import { TableQueryParams } from '../interfaces/table-query-params.interface';

export abstract class TableRepository implements BaseRepository<Table> {
  abstract create(entity: Table): Promise<Table>;
  abstract findById(id: string): Promise<Table | null>;
  abstract findIdleTables(): Promise<Table[]>;
  abstract delete(id: string): Promise<void>;
  abstract update(id: string, entity: Partial<Table>): Promise<Table>;
  abstract getAllPaged(params: TableQueryParams): Promise<Page<Table>>;
}
