import { PaginationParams } from '../../../common/interfaces';
import { SortField } from '../../../common/interfaces';
export type ImageSortField = 'fileName' | 'createdAt' | 'updatedAt';
/**
 * Represents the sorting option for image queries.
 *
 * @template T - The allowed field names for sorting.
 * @property {T} field - The field to sort by (e.g., 'fileName', 'createdAt', 'updatedAt').
 * @property {'asc' | 'desc'} direction - The direction of sorting: ascending ('asc') or descending ('desc').
 */
export type ImageOrderBy = Array<SortField<ImageSortField>>;
/**
 * Represents the filter options available for querying images.
 *
 * @property {string} [sessionId] - Filter by session ID.
 * @property {string} [entityType] - Filter by entity type (e.g., 'USER', 'PRODUCT').
 * @property {string} [entityId] - Filter by entity ID.
 * @property {boolean} [isConfirmed] - Whether to filter only confirmed images.
 */
export interface ImageQueryFilter {
  sessionId?: string;
  entityType?: string;
  entityId?: string;
  isConfirmed?: boolean;
}
/**
 * Parameters for querying images with pagination, filtering, and sorting.
 *
 * @property {number} [page] - The page number to retrieve (from PaginationParams).
 * @property {number} [pageSize] - The number of items per page (from PaginationParams).
 * @property {ImageOrderBy} [orderBy] - Array of sorting options for specific fields and direction.
 * @property {ImageQueryFilter} [filter] - Filtering options for images.
 */
export interface ImageQueryParams extends PaginationParams {
  /**
   * Specifies sorting options for the query. Each object in the array defines a field to sort by and the direction.
   *
   * @Example
   *   orderBy: [
   *     { field: 'fileName', direction: 'asc' },
   *     { field: 'createdAt', direction: 'desc' }
   *   ]
   */
  orderBy?: ImageOrderBy;
  filter?: ImageQueryFilter;
}
