import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { OrderTaxRepository } from '../../taxes/repositories';
import { PromotionRedemptionRepository } from '../../promotions/repositories';
import { Order } from '../shared';
import { OrderTax } from '../../taxes';
import { PromotionRedemption } from '../../promotions/types';
import { OrderNotFoundException } from '../shared';
import { OrderRepository } from '../shared/repositories/order-repository.abstract';

export interface ReceiptResult {
  order: Order;
  orderTaxes: OrderTax[];
  redemptions: PromotionRedemption[];
}

@Injectable()
export class GetReceiptService {
  constructor(
    private readonly orderRepository: OrderRepository,
    private readonly orderTaxRepository: OrderTaxRepository,
    @Inject(forwardRef(() => PromotionRedemptionRepository))
    private readonly promotionRedemptionRepository: PromotionRedemptionRepository,
  ) {}

  /**
   * Returns the permanent receipt for a paid order.
   *
   * Reads exclusively from the immutable ledger tables (OrderTax and
   * PromotionRedemption) — never from snapshot tables.
   *
   * @param orderId - The completed order whose receipt is requested.
   * @returns Order details, permanent tax records, and promotion redemptions.
   */
  async getReceipt(orderId: string): Promise<ReceiptResult> {
    const order = await this.orderRepository.findById(orderId);
    if (!order) throw new OrderNotFoundException(orderId);

    const [orderTaxes, redemptions] = await Promise.all([
      this.orderTaxRepository.findByOrderId(orderId),
      this.promotionRedemptionRepository.findByOrderId(orderId),
    ]);
    return { order, orderTaxes, redemptions };
  }
}
