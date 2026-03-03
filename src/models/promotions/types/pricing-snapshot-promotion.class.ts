import { PricingSnapshot } from './pricing-snapshot.class';
import { Promotion } from './promotion.class';

export class PricingSnapshotPromotion {
  constructor(
    public id: string | null,
    public snapshotId: string,
    public promotionId: string,
    public promotionCode: string,
    public promotionVersion: number,
    public discountAmount: number,
    // Relations
    public snapshot: PricingSnapshot | null,
    public promotion: Promotion | null,
  ) {}
}
