import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../providers/prisma/prisma.service';
import { PromotionRedemptionRepository } from './promotion-redemption-repository.abstract';
import { PromotionRedemption, PromotionRedemptionMapper } from '../types';

@Injectable()
export class PromotionRedemptionRepositoryImpl implements PromotionRedemptionRepository {
  constructor(private readonly prismaService: PrismaService) {}

  /**
   * Creates a new promotion redemption entry in the database.
   *
   * This method takes a domain `PromotionRedemption` entity, maps it to the Prisma schema for creation,
   * and then maps the result back to a domain `PromotionRedemption` entity. It also includes the
   * associated promotion details in the returned object.
   *
   * @param {PromotionRedemption} entity The promotion redemption entity containing details like order ID, promotion ID, etc.
   * @returns {Promise<PromotionRedemption>} A promise that resolves to the newly created promotion redemption entity, including its associated promotion.
   */
  async create(entity: PromotionRedemption): Promise<PromotionRedemption> {
    return await this.prismaService.promotionRedemption
      .create({
        data: PromotionRedemptionMapper.toPrismaCreate(entity),
        include: { promotion: true },
      })
      .then(PromotionRedemptionMapper.toDomain);
  }

  /**
   * Finds all promotion redemption entries associated with a specific order ID.
   * This method queries the database for all redemption records where the `order_id`
   * matches the provided `orderId`. It also includes the associated promotion details
   * for each redemption entry. The results are mapped from Prisma models to domain `PromotionRedemption` entities.
   *
   * @param {string} orderId The unique identifier of the order for which to retrieve promotion redemptions.
   * @returns {Promise<PromotionRedemption[]>} A promise that resolves to an array of `PromotionRedemption` entities, each including its associated promotion. Returns an empty array if no redemptions are found for the given order ID.
   */
  async findByOrderId(orderId: string): Promise<PromotionRedemption[]> {
    const rows = await this.prismaService.promotionRedemption.findMany({
      where: { order_id: orderId },
      include: { promotion: true },
    });
    return rows.map(PromotionRedemptionMapper.toDomain);
  }

  /**
   * Deletes all promotion redemption entries associated with a specific order ID.
   *
   * @param {string} orderId The unique identifier of the order for which to delete promotion redemptions.
   * @returns {Promise<number>} A promise that resolves to the number of deleted promotion redemption entries.
   */
  async deleteByOrderId(orderId: string): Promise<number> {
    return await this.prismaService.promotionRedemption
      .deleteMany({ where: { order_id: orderId } })
      .then((result) => result.count);
  }

  /**
   * Deletes all promotion redemption entries associated with a list of order IDs.
   * If the provided `orderIds` array is empty, no deletion operation will be performed, and the method will return 0.
   *
   * @param {string[]} orderIds An array of unique identifiers of the orders for which to delete promotion redemptions.
   * @returns {Promise<number>} A promise that resolves to the number of deleted promotion redemption entries.
   */
  async deleteByOrderIds(orderIds: string[]): Promise<number> {
    if (orderIds.length === 0) return 0;
    return await this.prismaService.promotionRedemption
      .deleteMany({ where: { order_id: { in: orderIds } } })
      .then((result) => result.count);
  }
}
