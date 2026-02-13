import { PaginationParams } from '../../../common/interfaces';
import { SortField } from '../../../common/interfaces';
import { TableStatus } from '../enums';

export type TableSortField =
  | 'name'
  | 'capacity'
  | 'status'
  | 'createdAt'
  | 'updatedAt';

/**
 * Represents the sorting option for table queries.
 *
 * @template T - The allowed field names for sorting.
 * @property {T} field - The field to sort by (e.g., 'name', 'capacity', 'status', 'createdAt', 'updatedAt').
 * @property {'asc' | 'desc'} direction - The direction of sorting: ascending ('asc') or descending ('desc').
 */
export type TableOrderBy = Array<SortField<TableSortField>>;

/**
 * Represents the filter options available for querying tables.
 *
 * @property {string} [query] - Search query string to match table names.
 * @property {boolean} [isActive] - Whether to filter only active tables.
 * @property {TableStatus} [status] - Filter by table status.
 * @property {string} [floorId] - Filter by floor ID.
 * @property {string} [zoneId] - Filter by zone ID.
 */
export interface TableQueryFilter {
  query?: string;
  isActive?: boolean;
  status?: TableStatus;
  floorId?: string;
  zoneId?: string;
}

/**
 * Parameters for querying tables with pagination, filtering, and sorting.
 *
 * @property {number} [page] - The page number to retrieve (from PaginationParams).
 * @property {number} [pageSize] - The number of items per page (from PaginationParams).
 * @property {TableOrderBy} [orderBy] - Array of sorting options for specific fields and direction.
 * @property {TableQueryFilter} [filter] - Filtering options for tables.
 */
export interface TableQueryParams extends PaginationParams {
  /**
   * Specifies sorting options for the query. Each object in the array defines a field to sort by and the direction.
   *
   * @Example
   *   orderBy: [
   *     { field: 'name', direction: 'asc' },
   *     { field: 'capacity', direction: 'desc' }
   *   ]
   */
  orderBy?: TableOrderBy;
  filter?: TableQueryFilter;
}
