import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { OrderTaxRepository } from '../../taxes/repositories/order-tax-repository.abstract';
import { PromotionRedemptionRepository } from '../../promotions/repositories/promotion-redemption-repository.abstract';
import { Order } from '../shared/entities/order';
import { OrderTax } from '../../taxes/entities/order-tax';
import { PromotionRedemption } from '../../promotions/types/promotion-redemption';
import { OrderNotFoundException } from '../shared/exceptions/order-not-found.exception';
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
