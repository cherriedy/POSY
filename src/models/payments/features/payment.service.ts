import { Injectable } from '@nestjs/common';
import { Page } from '../../../common/interfaces';
import { Payment, PaymentQueryParams } from '../shared';
import { PaymentRepository } from '../shared/repositories/payment-repository.abstract';

@Injectable()
export class PaymentService {
  constructor(private readonly paymentRepository: PaymentRepository) {}

  /**
   * Returns paginated payments for internal users.
   *
   * @param params Query parameters for filtering, sorting, and pagination.
   */
  async getPayments(params: PaymentQueryParams): Promise<Page<Payment>> {
    return this.paymentRepository.getAllPaged(params);
  }
}
