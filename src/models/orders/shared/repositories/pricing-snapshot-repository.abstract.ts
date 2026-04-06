import { PricingSnapshot } from '../../../promotions/types';

export abstract class PricingSnapshotRepository {
  /**
   * Creates a new pricing snapshot in the data store.
   *
   * @param entity - The PricingSnapshot domain entity to persist.
   * @returns The created PricingSnapshot domain entity.
   */
  abstract create(entity: PricingSnapshot): Promise<PricingSnapshot>;

  /**
   * Finds a pricing snapshot by the associated order ID.
   *
   * @param orderId - The ID of the order whose pricing snapshot is to be retrieved.
   * @returns The found PricingSnapshot domain entity, or null if not found.
   */
  abstract findByOrderId(orderId: string): Promise<PricingSnapshot | null>;

  /**
   * Deletes a pricing snapshot by the associated order ID.
   *
   * @param orderId - The ID of the order whose pricing snapshot is to be deleted.
   */
  abstract deleteByOrderId(orderId: string): Promise<void>;
}
