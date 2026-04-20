import { PromotionRedemption } from './promotion-redemption';
import {
  Prisma,
  PromotionRedemption as PrismaPromotionRedemption,
} from '@prisma/client';
import { PromotionMapper } from './promotion.mapper';
import { PricingSnapshotMapper } from './pricing-snapshot.mapper';
import { OrderMapper } from '../../orders/shared/entities';

export class PromotionRedemptionMapper {
  static toDomain(
    this: void,
    prisma: PrismaPromotionRedemption,
  ): PromotionRedemption {
    return new PromotionRedemption(
      prisma.id,
      prisma.promotion_id,
      prisma.snapshot_id,
      prisma.order_id,
      prisma.redeemed_at,
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      (prisma as any).promotion
        ? // eslint-disable-next-line @typescript-eslint/no-unsafe-argument,@typescript-eslint/no-unsafe-member-access
          PromotionMapper.toDomain((prisma as any).promotion)
        : null,
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      (prisma as any).snapshot
        ? // eslint-disable-next-line @typescript-eslint/no-unsafe-argument,@typescript-eslint/no-unsafe-member-access
          PricingSnapshotMapper.toDomain((prisma as any).snapshot)
        : null,
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      (prisma as any).order
        ? // eslint-disable-next-line @typescript-eslint/no-unsafe-argument,@typescript-eslint/no-unsafe-member-access
          OrderMapper.toDomain((prisma as any).order)
        : null,
    );
  }

  static toPrismaCreate(
    domain: PromotionRedemption,
  ): Prisma.PromotionRedemptionUncheckedCreateInput {
    return {
      promotion_id: domain.promotionId,
      snapshot_id: domain.snapshotId,
      order_id: domain.orderId,
      redeemed_at: domain.redeemedAt,
    };
  }
}
