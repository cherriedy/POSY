import { Promotion } from './promotion';
import { PricingSnapshot } from './pricing-snapshot';
import { Order } from '@posy/orders/entities/order';

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
