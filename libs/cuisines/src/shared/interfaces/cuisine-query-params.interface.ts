import { PaginationParams } from '@posy/shared';
import { OrderBy } from '@posy/shared';

/**
 * Represents the allowed fields by which cuisines can be sorted.
 */
export type CuisineSortField = 'name' | 'region' | 'createdAt' | 'updatedAt';

export type CuisineOrderBy = Array<OrderBy<CuisineSortField>>;

export interface CuisineQueryFilter {
  query: string | null;
  isDeleted: boolean | null;
}

export interface CuisineQueryParams extends PaginationParams {
  orderBy: CuisineOrderBy | null;
  filter: CuisineQueryFilter | null;
}
