import { PaginationParams, SortField } from 'src/common/interfaces';

/**
 * Represents the allowed fields by which cuisines can be sorted.
 * - 'name': Sort by the cuisine's name.
 * - 'region': Sort by the cuisine's region.
 * - 'createdAt': Sort by the creation timestamp.
 * - 'updatedAt': Sort by the last update timestamp.
 */
export type CuisineSortField = 'name' | 'region' | 'createdAt' | 'updatedAt';

/**
 * Represents the sorting option for cuisine queries.
 *
 * @template T - The allowed field names for sorting.
 * @property {T} field - The field to sort by (e.g., 'name', 'region', 'createdAt', 'updatedAt').
 * @property {'asc' | 'desc'} direction - The direction of sorting: ascending ('asc') or descending ('desc').
 *
 * @example
 *   orderBy: [
 *     { field: 'name', direction: 'asc' },
 *     { field: 'createdAt', direction: 'desc' }
 *   ]
 */
export type CuisineOrderBy = Array<SortField<CuisineSortField>>;

/**
 * Represents the filter options available for querying cuisines.
 *
 * @property {string} [q] - Search query string to match cuisine names or other attributes.
 */
export interface CuisineQueryFilter {
  query: string | null;
  isDeleted: boolean | null;
}

/**
 * Parameters for querying cuisines with pagination, filtering, and sorting.
 *
 * @property {number} [page] - The page number to retrieve (from PaginationParams).
 * @property {number} [pageSize] - The number of items per page (from PaginationParams).
 * @property {CuisineOrderBy} [orderBy] - Array of sorting options for specific fields and direction.
 * @property {CuisineQueryFilter} [filter] - Filtering options for cuisines.
 */
export interface CuisineQueryParams extends PaginationParams {
  /**
   * Specifies sorting options for the query. Each object in the array defines a field to sort by and the direction.
   *
   * @example
   *   orderBy: [
   *     { field: 'name', direction: 'asc' },
   *     { field: 'createdAt', direction: 'desc' }
   *   ]
   */
  orderBy: CuisineOrderBy | null;
  filter: CuisineQueryFilter | null;
}
