import { OrderBy, PaginationParams } from '../../../../common/interfaces';

/**
 * Allowed fields for sorting payment methods.
 *
 * - 'name': Sort by payment method name.
 * - 'feeType': Sort by the type of fee (e.g., percentage, fixed).
 * - 'feeValue': Sort by the fee value (numeric).
 */
export type PaymentMethodSortField = 'name' | 'feeType' | 'feeValue';

/**
 * Represents the sorting option for payment method queries.
 *
 * @template T - The allowed field names for sorting.
 * @property {T} field - The field to sort by (e.g., 'name', 'feeType', 'feeValue').
 * @property {'asc' | 'desc'} direction - The direction of sorting: ascending ('asc') or descending ('desc').
 *
 * @example
 *   orderBy: [
 *     { field: 'name', direction: 'asc' },
 *     { field: 'feeValue', direction: 'desc' }
 *   ]
 */
export type PaymentMethodOrderBy = Array<OrderBy<PaymentMethodSortField>>;

/**
 * Represents the filter options available for querying payment methods.
 *
 * @property {boolean} [enabledOnly] - If true, only enabled (active) payment methods are returned.
 */
export interface PaymentMethodQueryFilter {
  enabledOnly?: boolean;
}

/**
 * Parameters for querying payment methods with pagination, filtering, and sorting.
 *
 * @property {number} [page] - The page number to retrieve (from PaginationParams).
 * @property {number} [pageSize] - The number of items per page (from PaginationParams).
 * @property {PaymentMethodOrderBy} [orderBy] - Array of sorting options for specific fields and direction.
 * @property {PaymentMethodQueryFilter} [filter] - Filtering options for payment methods.
 */
export interface PaymentMethodQueryParams extends PaginationParams {
  /**
   * Specifies sorting options for the query. Each object in the array defines a field to sort by and the direction.
   *
   * @example
   *   orderBy: [
   *     { field: 'name', direction: 'asc' },
   *     { field: 'feeValue', direction: 'desc' }
   *   ]
   */
  orderBy?: PaymentMethodOrderBy;

  filter?: PaymentMethodQueryFilter | null;
}
