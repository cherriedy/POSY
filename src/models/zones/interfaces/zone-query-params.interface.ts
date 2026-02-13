import { PaginationParams } from '../../../common/interfaces';
import { SortField } from '../../../common/interfaces';

export type ZoneSortField = 'name' | 'createdAt' | 'updatedAt';

/**
 * Represents the sorting option for zone queries.
 *
 * @template T - The allowed field names for sorting.
 * @property {T} field - The field to sort by (e.g., 'name', 'createdAt', 'updatedAt').
 * @property {'asc' | 'desc'} direction - The direction of sorting: ascending ('asc') or descending ('desc').
 */
export type ZoneOrderBy = Array<SortField<ZoneSortField>>;
/**
 * Represents the filter options available for querying zones.
 *
 * @property {string} [query] - Search query string to match zone names.
 * @property {boolean} [isActive] - Whether to filter only active zones.
 */
export interface ZoneQueryFilter {
  query?: string;
  isActive?: boolean;
}
/**
 * Parameters for querying zones with pagination, filtering, and sorting.
 *
 * @property {number} [page] - The page number to retrieve (from PaginationParams).
 * @property {number} [pageSize] - The number of items per page (from PaginationParams).
 * @property {ZoneOrderBy} [orderBy] - Array of sorting options for specific fields and direction.
 * @property {ZoneQueryFilter} [filter] - Filtering options for zones.
 */
export interface ZoneQueryParams extends PaginationParams {
  /**
   * Specifies sorting options for the query. Each object in the array defines a field to sort by and the direction.
   *
   * @Example
   *   orderBy: [
   *     { field: 'name', direction: 'asc' },
   *     { field: 'createdAt', direction: 'desc' }
   *   ]
   */
  orderBy?: ZoneOrderBy;
  filter?: ZoneQueryFilter;
}
