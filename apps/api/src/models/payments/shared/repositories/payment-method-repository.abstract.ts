import { BaseRepository } from '@posy/shared';
import { Page } from '@posy/shared';
import { PaymentMethod } from '../entities/payment-method';
import { PaymentMethodQueryParams } from '../interfaces/payment-method-query-params.interface';

export abstract class PaymentMethodRepository implements BaseRepository<PaymentMethod> {
  /**
   * Finds a payment method by id.
   */
  abstract findById(id: string): Promise<PaymentMethod | null>;

  /**
   * Returns a paginated list of payment methods based on query params.
   *
   * @param params Filtering, sorting, and pagination options.
   */
  abstract getAllPaged(
    params: PaymentMethodQueryParams,
  ): Promise<Page<PaymentMethod>>;

  /**
   * Toggles the active flag of a payment method.
   *
   * @param id Payment method UUID.
   */
  abstract toggle(id: string): Promise<PaymentMethod>;
}
