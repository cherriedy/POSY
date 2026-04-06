import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../providers/prisma/prisma.service';
import { PromotionRedemptionRepository } from './promotion-redemption-repository.abstract';
import { PromotionRedemption, PromotionRedemptionMapper } from '../types';

@Injectable()
export class PromotionRedemptionRepositoryImpl implements PromotionRedemptionRepository {
  constructor(private readonly prismaService: PrismaService) {}

  async findByOrderId(orderId: string): Promise<PromotionRedemption[]> {
    const rows = await this.prismaService.promotionRedemption.findMany({
      where: { order_id: orderId },
      include: { promotion: true },
    });
    return rows.map(PromotionRedemptionMapper.toDomain);
  }
}
