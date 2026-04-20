import { PromotionRedemption } from '../types';

export abstract class PromotionRedemptionRepository {
  /**
   * Persists a promotion redemption record.
   */
  abstract create(entity: PromotionRedemption): Promise<PromotionRedemption>;

  /**
   * Returns all permanent redemption records for the given order.
   * Never reads from snapshot tables.
   */
  abstract findByOrderId(orderId: string): Promise<PromotionRedemption[]>;

  /**
   * Releases reserved redemptions by order id.
   *
   * @returns Number of deleted rows.
   */
  abstract deleteByOrderId(orderId: string): Promise<number>;

  /**
   * Releases reserved redemptions for many orders.
   *
   * @returns Number of deleted rows.
   */
  abstract deleteByOrderIds(orderIds: string[]): Promise<number>;
}
