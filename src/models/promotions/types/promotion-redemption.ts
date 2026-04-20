import { Promotion } from './promotion.class';
import { PricingSnapshot } from './pricing-snapshot.class';
import { Order } from '../../orders/shared/entities';

export class PromotionRedemption {
  constructor(
    public id: string | null,
    public promotionId: string,
    public snapshotId: string,
    public orderId: string,
    public redeemedAt: Date,
    // Relations
    public promotion: Promotion | null,
    public snapshot: PricingSnapshot | null,
    public order: Order | null,
  ) {}
}
