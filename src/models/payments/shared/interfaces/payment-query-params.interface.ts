import { OrderBy, PaginationParams } from '../../../../common/interfaces';
import { PaymentStatus } from '../enums';

/**
 * Allowed fields for sorting payment records.
 */
export type PaymentSortField = 'amount' | 'status' | 'paidAt' | 'createdAt';

/**
 * Sorting options for payment queries.
 */
export type PaymentOrderBy = Array<OrderBy<PaymentSortField>>;

/**
 * Filter options for querying payments.
 */
export interface PaymentQueryFilter {
  /** Optional filter by order id. */
  orderId?: string;

  /** Optional filter by payment method id. */
  methodId?: string;

  /** Optional filter by user id that initiated the payment. */
  createdBy?: string;

  /** Optional filter by payment status. */
  status?: PaymentStatus;
}

/**
 * Parameters for querying payments with pagination, sorting, and filtering.
 */
export interface PaymentQueryParams extends PaginationParams {
  /** Sorting configuration for the query result. */
  orderBy?: PaymentOrderBy;

  /** Filtering configuration for the query result. */
  filter?: PaymentQueryFilter | null;
}
