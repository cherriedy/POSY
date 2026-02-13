import { PaginationParams, SortField } from '../../../common/interfaces';
import { TaxType, TaxRateType } from '../enums';

export type TaxSortField =
  | 'rate'
  | 'name'
  | 'sortOrder'
  | 'createdAt'
  | 'updatedAt';

/**
 * Represents the sorting option for tax queries.
 *
 * @template T - The allowed field names for sorting.
 * @property {T} field - The field to sort by (e.g., 'rate', 'name', 'sortOrder', 'createdAt', 'updatedAt').
 * @property {'asc' | 'desc'} direction - The direction of sorting: ascending ('asc') or descending ('desc').
 *
 * @example
 *   orderBy: [
 *     { field: 'rate', direction: 'asc' },
 *     { field: 'name', direction: 'desc' }
 *   ]
 */
export type TaxOrderBy = Array<SortField<TaxSortField>>;

/**
 * Represents the filter options available for querying taxes.
 *
 * @property {string} [query] - Search query string to match tax names or descriptions.
 * @property {TaxType[]} [type] - List of tax types to filter (e.g., VAT, SERVICE).
 * @property {TaxRateType[]} [rateType] - List of rate types to filter (e.g., PERCENTAGE, FIXED).
 * @property {boolean} [isActive] - Whether to filter only active taxes.
 * @property {boolean} [isIncluded] - Whether to filter taxes included in price.
 * @property {boolean} [applyAfterVAT] - Whether to filter taxes applied after VAT.
 * @property {boolean} [isDeleted] - Whether to filter only deleted taxes.
 */
export interface TaxQueryFilters {
  query?: string;
  type?: TaxType[];
  rateType?: TaxRateType[];
  isActive?: boolean;
  isIncluded?: boolean;
  applyAfterVAT?: boolean;
  isDeleted?: boolean;
}

/**
 * Parameters for querying taxes with pagination, filtering, and sorting.
 *
 * @property {number} [page] - The page number to retrieve (from PaginationParams).
 * @property {number} [pageSize] - The number of items per page (from PaginationParams).
 * @property {TaxOrderBy} [orderBy] - Array of sorting options for specific fields and direction.
 * @property {TaxQueryFilters} [filter] - Filtering options for taxes.
 *
 * @example
 *   {
 *     page: 1,
 *     pageSize: 20,
 *     orderBy: [
 *       { field: 'rate', direction: 'asc' },
 *       { field: 'name', direction: 'desc' }
 *     ],
 *     filter: {
 *       query: 'VAT',
 *       type: ['VAT'],
 *       isActive: true
 *     }
 *   }
 */
export interface TaxQueryParams extends PaginationParams {
  orderBy?: TaxOrderBy;
  filter?: TaxQueryFilters;
}
