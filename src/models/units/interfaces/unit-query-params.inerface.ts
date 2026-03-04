import { PaginationParams, OrderBy } from '../../../common/interfaces';

export type UnitSortField = 'name' | 'abbreviation' | 'createdAt' | 'updatedAt';

/**
 * Represents the sorting option for unit queries.
 *
 * @template T - The allowed field names for sorting.
 * @property {T} field - The field to sort by (e.g., 'name', 'abbreviation', 'createdAt', 'updatedAt').
 * @property {'asc' | 'desc'} direction - The direction of sorting: ascending ('asc') or descending ('desc').
 */
export type UnitOrderBy = Array<OrderBy<UnitSortField>>;

/**
 * Represents the filter options available for querying units.
 *
 * @property {string} [query] - Search query string to match unit name or abbreviation.
 * @property {boolean} [isDeleted] - Whether to filter only deleted units.
 */
export interface UnitQueryFilter {
  query?: string;
  isDeleted?: boolean;
}

/**
 * Parameters for querying units with pagination, filtering, and sorting.
 *
 * @property {number} [page] - The page number to retrieve (from PaginationParams).
 * @property {number} [pageSize] - The number of items per page (from PaginationParams).
 * @property {UnitOrderBy} [orderBy] - Array of sorting options for specific fields and direction.
 * @property {UnitQueryFilter} [filter] - Filtering options for units.
 */
export interface UnitQueryParams extends PaginationParams {
  /**
   * Specifies sorting options for the query. Each object in the array defines a field to sort by and the direction.
   *
   * @example
   *   orderBy: [
   *     { field: 'name', direction: 'asc' },
   *     { field: 'createdAt', direction: 'desc' }
   *   ]
   */
  orderBy?: UnitOrderBy;

  filter?: UnitQueryFilter;
}
