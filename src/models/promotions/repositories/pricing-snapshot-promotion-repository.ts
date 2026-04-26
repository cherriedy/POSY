import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../providers/prisma/prisma.service';
import { PricingSnapshotPromotionRepository } from './pricing-snapshot-promotion-repository.abstract';
import {
  PricingSnapshotPromotion,
  PricingSnapshotPromotionMapper,
} from '../types';

@Injectable()
export class PricingSnapshotPromotionRepositoryImpl
  implements PricingSnapshotPromotionRepository
{
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
