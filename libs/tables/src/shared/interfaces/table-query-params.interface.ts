import { PaginationParams } from '@posy/shared';
import { OrderBy } from '@posy/shared';
import { TableStatus } from '../enums/table-status.enum';

export type TableSortField =
  | 'name'
  | 'capacity'
  | 'status'
  | 'createdAt'
  | 'updatedAt';

export type TableOrderBy = Array<OrderBy<TableSortField>>;

export interface TableQueryFilter {
  query?: string;
  isActive?: boolean;
  status?: TableStatus;
  zoneId?: string;
}

export interface TableQueryParams extends PaginationParams {
  orderBy?: TableOrderBy;
  filter?: TableQueryFilter;
}
