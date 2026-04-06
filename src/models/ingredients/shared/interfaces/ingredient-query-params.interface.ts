import { PaginationParams, OrderBy } from '../../../../common/interfaces';

export type IngredientSortField =
  | 'name'
  | 'stock'
  | 'minStock'
  | 'unitCost'
  | 'expiredAt'
  | 'createdAt'
  | 'updatedAt';

/**
 * Represents the sorting option for ingredient queries.
 *
 * @template T - The allowed field names for sorting.
 * @property {T} field - The field to sort by.
 * @property {'asc' | 'desc'} direction - The direction of sorting.
 *
 * @example
 *   orderBy: [
 *     { field: 'name', direction: 'asc' },
 *     { field: 'createdAt', direction: 'desc' }
 *   ]
 */
export type IngredientOrderBy = Array<OrderBy<IngredientSortField>>;

/**
 * Represents the filter options available for querying ingredients.
 *
 * @property {string} [vendorId] - Filter by vendor ID.
 * @property {string} [unitId] - Filter by unit ID.
 * @property {string} [query] - Search query string to match ingredient names.
 */
export interface IngredientQueryFilter {
  vendorId?: string | null;
  unitId?: string | null;
  query?: string | null;
}

/**
 * Parameters for querying ingredients with pagination, filtering, and sorting.
 *
 * @property {number} [page] - The page number to retrieve (from PaginationParams).
 * @property {number} [pageSize] - The number of items per page (from PaginationParams).
 * @property {IngredientOrderBy} [orderBy] - Array of sorting options for specific fields and direction.
 * @property {IngredientQueryFilter} [filter] - Filtering options for ingredients.
 */
export interface IngredientQueryParams extends PaginationParams {
  /**
   * Specifies sorting options for the query. Each object in the array defines a field to sort by and the direction.
   *
   * @example
   *   orderBy: [
   *     { field: 'name', direction: 'asc' },
   *     { field: 'unitCost', direction: 'desc' }
   *   ]
   */
  orderBy?: IngredientOrderBy;

  filter?: IngredientQueryFilter | null;
}
