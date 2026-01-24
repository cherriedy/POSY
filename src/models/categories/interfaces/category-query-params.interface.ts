import { PaginationParams } from '../../../common/interfaces';
import { SortField } from '../../../common/interfaces';

export type CategorySortField = 'name' | 'createdAt' | 'updatedAt';

/**
 * Represents the sorting option for category queries.
 *
 * @template T - The allowed field names for sorting.
 * @property {T} field - The field to sort by (e.g., 'name', 'createdAt', 'updatedAt').
 * @property {'asc' | 'desc'} direction - The direction of sorting: ascending ('asc') or descending ('desc').
 */
export type CategoryOrderBy = Array<SortField<CategorySortField>>;

/**
 * Represents the filter options available for querying categories.
 *
 * @property {string} [query] - Search query string to match category names.
 * @property {boolean} [isActive] - Whether to filter only active categories.
 */
export interface CategoryQueryFilter {
  query?: string;
  isActive?: boolean;
}

/**
 * Parameters for querying categories with pagination, filtering, and sorting.
 *
 * @property {number} [page] - The page number to retrieve (from PaginationParams).
 * @property {number} [pageSize] - The number of items per page (from PaginationParams).
 * @property {CategoryOrderBy} [orderBy] - Array of sorting options for specific fields and direction.
 * @property {CategoryQueryFilter} [filter] - Filtering options for categories.
 */
export interface CategoryQueryParams extends PaginationParams {
  /**
   * Specifies sorting options for the query. Each object in the array defines a field to sort by and the direction.
   *
   * @Example
   *   orderBy: [
   *     { field: 'name', direction: 'asc' },
   *     { field: 'createdAt', direction: 'desc' }
   *   ]
   */
  orderBy?: CategoryOrderBy;

  filter?: CategoryQueryFilter;
}
