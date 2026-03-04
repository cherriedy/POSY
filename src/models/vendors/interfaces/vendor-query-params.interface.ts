import { PaginationParams, OrderBy } from '../../../common/interfaces';
import { VendorStatus } from '../enums';

export type VendorSortField =
  | 'name'
  | 'contactName'
  | 'address'
  | 'status'
  | 'suspendedAt'
  | 'deletedAt'
  | 'createdAt'
  | 'updatedAt';

/**
 * Represents the sorting option for vendor queries.
 *
 * @template T - The allowed field names for sorting.
 * @property {T} field - The field to sort by (e.g., 'name', 'createdAt').
 * @property {'asc' | 'desc'} direction - The direction of sorting: ascending ('asc') or descending ('desc').
 */
export type VendorOrderBy = Array<OrderBy<VendorSortField>>;

/**
 * Represents the filter options available for querying vendors.
 *
 * @property {string} [query] - Search query string to match vendor name, contact, or address.
 * @property {VendorStatus} [status] - Filter by vendor status (e.g., 'ACTIVE', 'INACTIVE', 'SUSPENDED').
 * @property {boolean} [isDeleted] - Whether to filter only deleted vendors.
 * @property {boolean} [isSuspended] - Whether to filter only suspended vendors.
 */
export interface VendorQueryFilter {
  query?: string;
  status?: VendorStatus;
  isDeleted?: boolean;
  isSuspended?: boolean;
}

/**
 * Parameters for querying vendors with pagination, filtering, and sorting.
 *
 * @property {number} [page] - The page number to retrieve (from PaginationParams).
 * @property {number} [pageSize] - The number of items per page (from PaginationParams).
 * @property {VendorOrderBy} [orderBy] - Array of sorting options for specific fields and direction.
 * @property {VendorQueryFilter} [filter] - Filtering options for vendors.
 */
export interface VendorQueryParams extends PaginationParams {
  /**
   * Specifies sorting options for the query. Each object in the array defines a field to sort by and the direction.
   *
   * @example
   *   orderBy: [
   *     { field: 'name', direction: 'asc' },
   *     { field: 'createdAt', direction: 'desc' }
   *   ]
   */
  orderBy?: VendorOrderBy;
  filter?: VendorQueryFilter;
}
