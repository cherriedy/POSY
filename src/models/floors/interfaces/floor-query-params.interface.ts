import { PaginationParams } from '../../../common/interfaces';
import { SortField } from '../../../common/interfaces';

export type FloorSortField = 'name' | 'order' | 'createdAt' | 'updatedAt';

/**
 * Represents the sorting option for floor queries.
 *
 * @template T - The allowed field names for sorting.
 * @property {T} field - The field to sort by (e.g., 'name', 'order', 'createdAt', 'updatedAt').
 * @property {'asc' | 'desc'} direction - The direction of sorting: ascending ('asc') or descending ('desc').
 */
export type FloorOrderBy = Array<SortField<FloorSortField>>;

/**
 * Represents the filter options available for querying floors.
 *
 * @property {string} [query] - Search query string to match floor names.
 * @property {boolean} [isActive] - Whether to filter only active floors.
 */
export interface FloorQueryFilter {
  query?: string;
  isActive?: boolean;
}

/**
 * Parameters for querying floors with pagination, filtering, and sorting.
 *
 * @property {number} [page] - The page number to retrieve (from PaginationParams).
 * @property {number} [pageSize] - The number of items per page (from PaginationParams).
 * @property {FloorOrderBy} [orderBy] - Array of sorting options for specific fields and direction.
 * @property {FloorQueryFilter} [filter] - Filtering options for floors.
 */
export interface FloorQueryParams extends PaginationParams {
  /**
   * Specifies sorting options for the query. Each object in the array defines a field to sort by and the direction.
   *
   * @Example
   *   orderBy: [
   *     { field: 'name', direction: 'asc' },
   *     { field: 'order', direction: 'asc' }
   *   ]
   */
  orderBy?: FloorOrderBy;
  filter?: FloorQueryFilter;
}
