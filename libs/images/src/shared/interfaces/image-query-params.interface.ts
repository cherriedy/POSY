import { PaginationParams } from '@posy/shared';
import { OrderBy } from '@posy/shared';

export type ImageSortField = 'fileName' | 'createdAt' | 'updatedAt';
export type ImageOrderBy = Array<OrderBy<ImageSortField>>;

export interface ImageQueryFilter {
  sessionId?: string;
  entityType?: string;
  entityId?: string;
  isConfirmed?: boolean;
}

export interface ImageQueryParams extends PaginationParams {
  orderBy?: ImageOrderBy;
  filter?: ImageQueryFilter;
}
