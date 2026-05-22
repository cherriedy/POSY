import { PricingSnapshotPromotion } from '../types/pricing-snapshot-promotion.class';

export abstract class PricingSnapshotPromotionRepository {
  /**
   * Persists a snapshot promotion record.
   */
  abstract create(
    entity: PricingSnapshotPromotion,
  ): Promise<PricingSnapshotPromotion>;
}
