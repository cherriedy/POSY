import { BaseRepository, Page } from '../../../../common/interfaces';
import { Payment } from '../entities';
import { PaymentQueryParams } from '../interfaces';

export abstract class PaymentRepository implements BaseRepository<Payment> {
  /**
   * Persists a new payment record.
   *
   * @param entity Payment domain object to store.
   */
  abstract create(entity: Payment): Promise<Payment>;

  /**
   * Returns a paginated list of payments based on query params.
   *
   * @param params Filtering, sorting, and pagination options.
   */
  abstract getAllPaged(params: PaymentQueryParams): Promise<Page<Payment>>;
}
