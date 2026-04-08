import { PromotionRedemption } from '../types';

export abstract class PromotionRedemptionRepository {
  /**
   * Returns all permanent redemption records for the given order.
   * Never reads from snapshot tables.
   */
  abstract findByOrderId(orderId: string): Promise<PromotionRedemption[]>;
}
