import { PricingSnapshotPromotion } from '../types';

export abstract class PricingSnapshotPromotionRepository {
  /**
   * Persists a snapshot promotion record.
   */
  abstract create(
    entity: PricingSnapshotPromotion,
  ): Promise<PricingSnapshotPromotion>;
}
