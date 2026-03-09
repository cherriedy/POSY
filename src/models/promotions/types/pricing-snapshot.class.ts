import { PricingSnapshotStatus } from '../enums';
import { PricingSnapshotPromotion } from './pricing-snapshot-promotion.class';
import { PricingSnapshotTax } from '../../taxes';
import { PromotionRedemption } from './promotion-redemption.class';
import { Order } from '../../orders/types';

export class PricingSnapshot {
  constructor(
    public id: string | null,
    public orderId: string | null,
    public subtotalAmount: number,
    public discountAmount: number,
    public totalTaxAmount: number = 0,
    public totalAmount: number,
    public status: PricingSnapshotStatus = PricingSnapshotStatus.QUOTED,
    public createdAt: Date | null = null,
    // Relations
    public promotions: PricingSnapshotPromotion[] | null = null,
    public taxes: PricingSnapshotTax[] | null = null,
    public redemptions: PromotionRedemption[] | null = null,
    public order: Order | null = null,
  ) {}
}
