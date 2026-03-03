import { PromotionProductRepository } from './promotion-product.repository-abstract';
import { Promotion, PromotionProduct, PromotionProductMapper } from '../types';
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../providers/prisma/prisma.service';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/client';
import { DuplicateEntryException } from '../../../common/exceptions';
import { PromotionProductNotFoundException } from '../exceptions';
import { PromotionStatus } from '@prisma/client';

@Injectable()
export class PromotionProductRepositoryImpl implements PromotionProductRepository {
  constructor(private readonly prismaService: PrismaService) { }

  async bulkCreate(
    entities: PromotionProduct[],
  ): Promise<PromotionProduct[]> {
    const prismaData = entities.map((e) =>
      PromotionProductMapper.toPrisma(e),
    );

    await this.prismaService.promotionProduct.createMany({
      data: prismaData,
    });

    const created = await this.prismaService.promotionProduct.findMany({
      where: {
        OR: prismaData.map((d) => ({
          promotion_id: d.promotion_id,
          product_id: d.product_id
        })),
      },
      include: {
        product: true
      },
    });

    return created.map(PromotionProductMapper.toDomain);
  }

  async findByPromotionId(
    promotionId: string,
  ): Promise<PromotionProduct[]> {
    return this.prismaService.promotionProduct
      .findMany({
        where: {
          promotion_id: promotionId,
        },
        include: {
          product: true,
        },
      })
      .then((items) =>
        items.map(PromotionProductMapper.toDomain),
      );
  }

  async findExistingByProduct(
    promotionId: string,
    productIds: string[],
  ) {
    return this.prismaService.promotionProduct.findMany({
      where: {
        promotion_id: promotionId,
        product_id: { in: productIds },
      },
    }).then((items) => items.map(PromotionProductMapper.toDomain));
  }

  async deleteByProductIds(
    promotionId: string,
    productIds: string[],
  ): Promise<number> {
    const result = await this.prismaService.promotionProduct.deleteMany({
      where: {
        promotion_id: promotionId,
        product_id: { in: productIds },
      },
    });

    return result.count;
  }

  /**
   * Deletes a PromotionProduct entity by its unique identifier.
   * Throws PromotionProductNotFoundException if the entity does not exist.
   *
   * @param {string} id - The unique identifier of the PromotionProduct to delete.
   * @returns {Promise<void>} Resolves when deletion is successful.
   * @throws {PromotionProductNotFoundException} If the PromotionProduct does not exist.
   * @throws {PrismaClientKnownRequestError} For other Prisma client errors.
   */
  // async delete(id: string): Promise<void> {
  //   try {
  //     await this.prismaService.promotionProduct.delete({
  //       where: { id },
  //     });
  //   } catch (e) {
  //     if (e instanceof PrismaClientKnownRequestError) {
  //       if (e.code === 'P2025') {
  //         throw new PromotionProductNotFoundException(id);
  //       }
  //     }
  //     throw e;
  //   }
  // }

  /**
   * Finds a PromotionProduct entity by its unique identifier.
   * Returns the domain entity if found, or null if not found.
   *
   * @param {string} id - The unique identifier of the PromotionProduct to find.
   * @returns {Promise<PromotionProduct | null>} The found PromotionProduct domain entity or null.
   */
  // async findById(id: string): Promise<PromotionProduct | null> {
  //   return await this.prismaService.promotionProduct
  //     .findUnique({
  //       where: { id },
  //     })
  //     ?.then(PromotionProductMapper.toDomain);
  // }

  /**
   * Retrieves all PromotionProduct entities from the database.
   * Maps the results to domain entities.
   *
   * @returns {Promise<PromotionProduct[]>} An array of all PromotionProduct domain entities.
   */
  async getAll(): Promise<PromotionProduct[]> {
    return await this.prismaService.promotionProduct
      .findMany({
        include: {
          promotion: true,
          product: true
        },
      })
      .then((results) => results.map(PromotionProductMapper.toDomain));
  }

  /**
   * Retrieves all promotions associated with a given product ID.
   * Queries the `promotionProduct` tables for records matching the specified product ID,
   * including the related `promotion` entity. Maps the results to domain `Promotion` entities,
   * filtering out any items where the promotion is not present.
   *
   * For STAFF users, only returns promotions that are ACTIVE and not deleted.
   * For ADMIN and MANAGER users, returns all promotions including deleted and disabled ones.
   *
   * @param {string} productId - The unique identifier of the product for which promotions are to be retrieved.
   * @param {boolean} includeAll - If true, includes promotions with all statuses (for ADMIN/MANAGER). If false, only includes ACTIVE promotions (for STAFF).
   * @returns {Promise<Promotion[]>} A promise that resolves to an array of `Promotion` domain entities associated with the product.
   *
   * @throws {PrismaClientKnownRequestError} For any Prisma client errors encountered during the query.
   */
  async getPromotionsByProductId(
    productId: string,
    includeAll: boolean = false,
  ): Promise<Promotion[]> {
    // Build the where clause based on user role
    const whereClause = includeAll
      ? { product_id: productId }
      : {
        product_id: productId,
        promotion: {
          status: PromotionStatus.ACTIVE,
          is_deleted: false,
        },
      };

    return await this.prismaService.promotionProduct
      .findMany({
        where: whereClause,
        include: { promotion: true },
      })
      .then((items) => {
        return items
          .map((item) => PromotionProductMapper.toDomain(item).promotion)
          .filter((promotion): promotion is Promotion => !!promotion);
      });
  }
}
