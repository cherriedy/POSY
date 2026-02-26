import { PromotionCategoryRepository } from './promotion-category.repository-abstract';
import {
  Promotion,
  PromotionCategory,
  PromotionCategoryMapper,
} from '../types';
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../providers/prisma/prisma.service';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/client';
import { DuplicateEntryException } from '../../../common/exceptions';
import { PromotionCategoryNotFoundException } from '../exceptions';
import { PromotionStatus } from '@prisma/client';
import { CategoryRepository } from '../../categories/repositories';
import { CategoryNotFoundException } from '../../categories/exceptions';

@Injectable()
export class PromotionCategoryRepositoryImpl implements PromotionCategoryRepository {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly categoryRepository: CategoryRepository,
  ) { }
  async bulkCreate(
    entities: PromotionCategory[],
  ): Promise<PromotionCategory[]> {
    const prismaData = entities.map((e) =>
      PromotionCategoryMapper.toPrisma(e),
    );

    await this.prismaService.promotionCategory.createMany({
      data: prismaData,
      skipDuplicates: true,
    });

    const created = await this.prismaService.promotionCategory.findMany({
      where: {
        OR: prismaData.map((d) => ({
          promotion_id: d.promotion_id,
          category_id: d.category_id,
        })),
      },
      include: {
        category: true,
      },
    });

    return created.map(PromotionCategoryMapper.toDomain);
  }

  async findByPromotionId(
    promotionId: string,
  ): Promise<PromotionCategory[]> {
    return this.prismaService.promotionCategory
      .findMany({
        where: {
          promotion_id: promotionId,
        },
        include: {
          category: true,
        },
      })
      .then((items) =>
        items.map(PromotionCategoryMapper.toDomain),
      );
  }

  async deleteByCategoryIds(
    promotionId: string,
    categoryIds: string[],
  ): Promise<number> {
    const result = await this.prismaService.promotionCategory.deleteMany({
      where: {
        promotion_id: promotionId,
        category_id: { in: categoryIds },
      },
    });

    return result.count;
  }

  /**
   * Retrieves all PromotionCategory entities from the database.
   * @returns An array of PromotionCategory domain objects.
   */
  async getAll(): Promise<PromotionCategory[]> {
    return await this.prismaService.promotionCategory
      .findMany({
        include: {
          promotion: true,
          category: true,
        },
      })
      .then((records) => records.map(PromotionCategoryMapper.toDomain));
  }

  /**
   * Retrieves all promotions associated with a specific category ID.
   *
   * This method queries the database for all `PromotionCategory` records that match the given
   * `categoryId`, including their related `promotion` entities. It then maps each result to its
   * domain representation and extracts the associated `Promotion` objects, filtering out any
   * undefined or null values.
   *
   * For STAFF users, only returns promotions that are ACTIVE and not deleted.
   * For ADMIN and MANAGER users, returns all promotions including deleted and disabled ones.
   *
   * @param categoryId - The unique identifier of the category for which promotions are to be retrieved.
   * @param includeAll - If true, includes promotions with all statuses (for ADMIN/MANAGER). If false, only includes ACTIVE promotions (for STAFF).
   * @returns A promise that resolves to an array of `Promotion` domain objects associated with the given category.
   */
  async getPromotionsByCategoryId(
    categoryId: string,
    includeAll: boolean = false,
  ): Promise<Promotion[]> {
    // Build the where clause based on user role
    const whereClause = includeAll
      ? { category_id: categoryId }
      : {
        category_id: categoryId,
        promotion: {
          status: PromotionStatus.ACTIVE,
          is_deleted: false,
        },
      };

    const items = await this.prismaService.promotionCategory.findMany({
      where: whereClause,
      include: { promotion: true },
    });
    return items
      .map((item) => PromotionCategoryMapper.toDomain(item).promotion)
      .filter((promotion): promotion is Promotion => !!promotion);
  }
}
