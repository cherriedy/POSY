import { PromotionRedemption as DomainPromotionRedemption } from './promotion-redemption.class';
import { PromotionRedemption as PrismaPromotionRedemption } from '@prisma/client';
import { PromotionMapper } from './promotion.mapper';
import { PricingSnapshotMapper } from './pricing-snapshot.mapper';
import { OrderMapper } from '../../orders/types';

export class PromotionRedemptionMapper {
  static toDomain(
    this: void,
    prisma: PrismaPromotionRedemption,
  ): DomainPromotionRedemption {
    return new DomainPromotionRedemption(
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

  static toPrisma(
    domain: DomainPromotionRedemption,
  ): PrismaPromotionRedemption {
    return <PrismaPromotionRedemption>{
      ...(domain.id ? { id: domain.id } : {}),
      promotion_id: domain.promotionId,
      snapshot_id: domain.snapshotId,
      order_id: domain.orderId,
      redeemed_at: domain.redeemedAt,
    };
  }
}
