import { Injectable } from '@nestjs/common';
import { Page } from '../../../common/interfaces';
import { PaymentMethod, PaymentMethodQueryParams } from '../shared';
import { PaymentMethodRepository } from '../shared/repositories/payment-method-repository.abstract';

@Injectable()
export class PaymentMethodsService {
  constructor(
    private readonly paymentMethodRepository: PaymentMethodRepository,
  ) {}

  /**
   * Returns a paginated list of payment methods based on the provided query parameters.
   * Used by both public and private controllers for listing payment methods.
   *
   * @param params Query parameters for filtering, sorting, and pagination
   */
  async getPaymentMethods(
    params: PaymentMethodQueryParams,
  ): Promise<Page<PaymentMethod>> {
    return this.paymentMethodRepository.getAllPaged(params);
  }

  /**
   * Toggles the active status of a payment method by its ID.
   * Used by the private controller for admin status changes.
   *
   * @param id Payment method UUID
   */
  async toggleStatus(id: string): Promise<PaymentMethod> {
    return this.paymentMethodRepository.toggle(id);
  }
}
