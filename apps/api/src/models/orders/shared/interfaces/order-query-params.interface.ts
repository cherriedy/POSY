import { PaginationParams } from '../../../../common/interfaces/pagination-params.interface';
import { OrderStatus } from '../enums/order-status.enum';

export interface OrderQueryFilter {
  sessionId?: string;
  tableId?: string;
  createdBy?: string;
  status?: OrderStatus;
}

export interface OrderQueryParams extends PaginationParams {
  filter?: OrderQueryFilter;
}
