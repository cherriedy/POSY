import { PricingSnapshotPromotion } from '../entities/pricing-snapshot-promotion';

export abstract class PricingSnapshotPromotionRepository {
  /**
   * Persists a snapshot promotion record.
   */
  abstract create(
    entity: PricingSnapshotPromotion,
  ): Promise<PricingSnapshotPromotion>;
}
