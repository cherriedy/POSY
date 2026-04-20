import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../providers/prisma/prisma.service';
import { PricingSnapshotPromotionRepository } from './pricing-snapshot-promotion-repository.abstract';
import {
  PricingSnapshotPromotion,
  PricingSnapshotPromotionMapper,
} from '../types';

@Injectable()
export class PricingSnapshotPromotionRepositoryImpl implements PricingSnapshotPromotionRepository {
  constructor(private readonly prismaService: PrismaService) {}

  async create(
    entity: PricingSnapshotPromotion,
  ): Promise<PricingSnapshotPromotion> {
    return await this.prismaService.pricingSnapshotPromotion
      .create({
        data: PricingSnapshotPromotionMapper.toPrismaCreate(entity),
      })
      .then(PricingSnapshotPromotionMapper.toDomain);
  }
}
