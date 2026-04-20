import { BaseRepository, Page } from '../../../../common/interfaces';
import { Payment } from '../entities';
import { PaymentStatus } from '../enums';
import { PaymentQueryParams } from '../interfaces';

export abstract class PaymentRepository implements BaseRepository<Payment> {
  /**
   * Persists a new payment record.
   *
   * @param entity Payment domain object to store.
   */
  abstract create(entity: Payment): Promise<Payment>;

  /**
   * Updates an existing payment record with new values.
   *
   * @returns The updated payment after changes are applied.
   */
  abstract update(id: string, entity: Partial<Payment>): Promise<Payment>;

  /**
   * Marks pending payments of an order with a new status.
   *
   * @returns Number of payments that were updated.
   */
  abstract updatePendingStatusByOrderId(
    orderId: string,
    status: PaymentStatus,
  ): Promise<number>;

  /**
   * Finds a payment by its unique identifier.
   *
   * @return The payment if found, or null if no payment exists with the given ID.
   */
  abstract findById(id: string): Promise<Payment | null>;

  /**
   * Returns pending payments created before the cutoff.
   *
   * @returns List of pending payments older than the cutoff date.
   */
  abstract findPendingOlderThan(cutoff: Date): Promise<Payment[]>;

  /**
   * Marks pending payments older than cutoff as EXPIRED.
   *
   * @return Number of payments that were marked as expired.
   */
  abstract expirePendingOlderThan(cutoff: Date): Promise<number>;

  /**
   * Returns a paginated list of payments based on query params.
   *
   * @param params Filtering, sorting, and pagination options.
   */
  abstract getAllPaged(params: PaymentQueryParams): Promise<Page<Payment>>;
}
