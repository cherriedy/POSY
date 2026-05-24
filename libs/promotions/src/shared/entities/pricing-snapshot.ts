import { PricingSnapshotPromotion } from './pricing-snapshot-promotion';
import { PricingSnapshotTax } from 'src/models/taxes/entities/pricing-snapshot-tax';
import { PromotionRedemption } from './promotion-redemption';
import { Order } from '@posy/orders/entities/order';

export class PricingSnapshot {
  constructor(
    public id: string | null,
    public orderId: string,
    public subtotalAmount: number,
    public discountAmount: number,
    public totalTaxAmount: number = 0,
    public totalAmount: number,
    public createdAt: Date | null = null,
    // Relations
    public promotions: PricingSnapshotPromotion[] | null = null,
    public taxes: PricingSnapshotTax[] | null = null,
    public redemptions: PromotionRedemption[] | null = null,
    public order: Order | null = null,
  ) {}
}
