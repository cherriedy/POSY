import { PaginationParams } from '../../../common/interfaces';
import { OrderStatus } from '../enums';

export interface OrderQueryFilter {
  sessionId?: string;
  tableId?: string;
  createdBy?: string;
  status?: OrderStatus;
}

export interface OrderQueryParams extends PaginationParams {
  filter?: OrderQueryFilter;
}
