import { Injectable } from '@nestjs/common';
import { Page } from '../../../common/interfaces';
import { Payment } from '../shared/entities';
import { PaymentQueryParams } from '../shared/interfaces';
import { PaymentRepository } from '../shared/repositories/payment-repository.abstract';

@Injectable()
export class PaymentCoreService {
  constructor(private readonly paymentRepository: PaymentRepository) {}

  /**
   * Returns paginated payments for internal users.
   *
   * @param params Query parameters for filtering, sorting, and pagination.
   */
  async getPayments(params: PaymentQueryParams): Promise<Page<Payment>> {
    return this.paymentRepository.getAllPaged(params);
  }

  async createCheckoutPayment(payment: Payment): Promise<Payment> {
    return await this.paymentRepository.create(payment);
  }

  async updateCheckoutPayment(
    id: string,
    entity: Partial<Payment>,
  ): Promise<Payment> {
    return await this.paymentRepository.update(id, entity);
  }
}
