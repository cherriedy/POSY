import { PricingSnapshotPromotion as DomainPricingSnapshotPromotion } from './pricing-snapshot-promotion.class';
import {
  Prisma,
  PricingSnapshotPromotion as PrismaPricingSnapshotPromotion,
} from '@prisma/client';
import { PricingSnapshotMapper } from './pricing-snapshot.mapper';
import { PromotionMapper } from './promotion.mapper';

export class PricingSnapshotPromotionMapper {
  static toDomain(
    this: void,
    prisma: PrismaPricingSnapshotPromotion,
  ): DomainPricingSnapshotPromotion {
    return new DomainPricingSnapshotPromotion(
      prisma.id,
      prisma.snapshot_id,
      prisma.promotion_id,
      prisma.promotion_code,
      prisma.promotion_version,
      prisma.discount_amount !== null && prisma.discount_amount !== undefined
        ? Number(prisma.discount_amount)
        : 0,
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      (prisma as any).snapshot
        ? // eslint-disable-next-line @typescript-eslint/no-unsafe-argument,@typescript-eslint/no-unsafe-member-access
          PricingSnapshotMapper.toDomain((prisma as any).snapshot)
        : null,
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      (prisma as any).promotion
        ? // eslint-disable-next-line @typescript-eslint/no-unsafe-argument,@typescript-eslint/no-unsafe-member-access
          PromotionMapper.toDomain((prisma as any).promotion)
        : null,
    );
  }

  static toPrisma(
    domain: DomainPricingSnapshotPromotion,
  ): PrismaPricingSnapshotPromotion {
    return <PrismaPricingSnapshotPromotion>{
      ...(domain.id ? { id: domain.id } : {}),
      snapshot_id: domain.snapshotId,
      promotion_id: domain.promotionId,
      promotion_code: domain.promotionCode,
      promotion_version: domain.promotionVersion,
      discount_amount:
        domain.discountAmount !== undefined && domain.discountAmount !== null
          ? new Prisma.Decimal(domain.discountAmount)
          : new Prisma.Decimal(0),
    };
  }
}
