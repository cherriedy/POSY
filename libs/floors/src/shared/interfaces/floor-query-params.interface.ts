import { PaginationParams } from '@posy/shared';
import { OrderBy } from '@posy/shared';

export type FloorSortField = 'name' | 'order' | 'createdAt' | 'updatedAt';

export type FloorOrderBy = Array<OrderBy<FloorSortField>>;

export interface FloorQueryFilter {
  query?: string;
  isActive?: boolean;
}

export interface FloorQueryParams extends PaginationParams {
  orderBy?: FloorOrderBy;
  filter?: FloorQueryFilter;
}
