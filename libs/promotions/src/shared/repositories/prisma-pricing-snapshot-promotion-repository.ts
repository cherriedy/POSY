import { Injectable } from '@nestjs/common';
import { PrismaService } from '@posy/shared';
import { PricingSnapshotPromotionRepository } from './pricing-snapshot-promotion-repository.abstract';
import { PricingSnapshotPromotion } from '../entities/pricing-snapshot-promotion';
import { PricingSnapshotPromotionMapper } from '../entities/pricing-snapshot-promotion.mapper';

@Injectable()
export class PrismaPricingSnapshotPromotionRepository implements PricingSnapshotPromotionRepository {
  constructor(private readonly prismaService: PrismaService) {}

  async create(
    entity: PricingSnapshotPromotion,
  ): Promise<PricingSnapshotPromotion> {
    return this.prismaService.pricingSnapshotPromotion
      .upsert({
        where: {
          snapshot_id_promotion_id: {
            snapshot_id: entity.snapshotId,
            promotion_id: entity.promotionId,
          },
        },
        create: PricingSnapshotPromotionMapper.toPrismaCreate(entity),
        update: {
          discount_amount: entity.discountAmount,
        },
      })
      .then(PricingSnapshotPromotionMapper.toDomain);
  }
}
