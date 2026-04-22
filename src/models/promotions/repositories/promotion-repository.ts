import { PromotionRepository } from './promotion-repository.abstract';
import { Promotion, PromotionMapper } from '../types';
import { Prisma, PromotionStatus } from '@prisma/client';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/client';
import { DuplicateEntryException } from '../../../common/exceptions';
import { Injectable } from '@nestjs/common';
import { PromotionNotFoundException } from '../exceptions';
import { PromotionQueryFilters, PromotionQueryParams } from '../interfaces';
import { camelCaseToSnakeCase } from '../../../common/utilities/string.util';
import { paginationConfig } from '../../../common/config';
import { PrismaService } from '../../../providers/prisma/prisma.service';
import { Page } from '../../../common/interfaces';

const { page: defaultPage, pageSize: defaultPageSize } =
  paginationConfig.default;

@Injectable()
export class PromotionRepositoryImpl implements PromotionRepository {
  constructor(private readonly prismaService: PrismaService) { }

  /**
   * Creates a new promotion in the database.
   * @param promotion - The promotion domain object to create.
   * @returns The created promotion domain object.
   * @throws {DuplicateEntryException} If a promotion with a unique field already exists.
   * @throws {PrismaClientKnownRequestError} For other Prisma errors.
   */
  async create(promotion: Promotion): Promise<Promotion> {
    const prismaPromotion = PromotionMapper.toPrisma(promotion);
    try {
      return await this.prismaService.promotion
        .create({
          data: prismaPromotion,
        })
        .then(PromotionMapper.toDomain);
    } catch (e) {
      if (e instanceof PrismaClientKnownRequestError) {
        if (e.code === 'P2002') {
          throw new DuplicateEntryException(
            'Promotion with provided unique field already exists',
          );
        }
      }
      throw e;
    }
  }

  /**
   * Soft deletes a promotion by setting is_deleted to true and updating deleted_at.
   * @param id - The ID of the promotion to delete.
   * @throws {PromotionNotFoundException} If the promotion does not exist.
   */
  async delete(id: string): Promise<void> {
    const existingPromotion = await this.findById(id);
    if (!existingPromotion) {
      throw new PromotionNotFoundException({ id });
    }

    await this.prismaService.promotion.update({
      where: { id },
      data: {
        is_deleted: true,
        deleted_at: new Date(),
      },
    });
  }

  /**
   * Finds a promotion by its unique code.
   * @param code - The unique code of the promotion.
   * @returns The promotion domain object if found, otherwise null.
   */
  async findByCode(code: string): Promise<Promotion | null> {
    const record = await this.prismaService.promotion.findUnique({
      where: { code },
    });

    return record ? PromotionMapper.toDomain(record) : null;
  }

  /**
   * Finds a promotion by its unique identifier.
   * @param id - The unique ID of the promotion.
   * @returns The promotion domain object if found, otherwise null.
   */
  async findById(id: string): Promise<Promotion | null> {
    const record = await this.prismaService.promotion.findUnique({
      where: { id },
      include: {
      promotionProducts: true,
      promotionCategories: true,
    },
    });

    return record ? PromotionMapper.toDomain(record) : null;
  }

  /**
   * Retrieves a paginated list of promotions, optionally filtered by query parameters.
   * @param params - Pagination and filter parameters.
   * @returns A paginated list of promotion domain objects.
   */
  async getAllPaged(params: PromotionQueryParams): Promise<Page<Promotion>> {
    const { page = defaultPage, pageSize = defaultPageSize, filter } = params;
    const where = this.buildWhereClause(filter);
    const [items, total] = await Promise.all([
      this.prismaService.promotion.findMany({
        where,
        skip: (page - 1) * pageSize,
        take: pageSize,
        orderBy: { created_at: 'desc' },
      }),
      this.prismaService.promotion.count({ where }),
    ]);
    return {
      items: items.map(PromotionMapper.toDomain),
      page,
      pageSize,
      total,
      totalPages: Math.ceil(total / pageSize),
    };
  }

  async getAvailablePromotions(): Promise<any[]> {
    const now = new Date();

    return this.prismaService.promotion.findMany({
      where: {
        is_deleted: false,
        status: 'ACTIVE',
        start_at: { lte: now },
        end_at: { gte: now },
      },
      include: {
        promotionProducts: true,
        promotionCategories: true,
        _count: {
          select: {
            promotionRedemptions: true,
          },
        },
      },
      orderBy: {
        priority: 'desc',
      },
    });
  }

  /**
   * Updates a promotion by its ID with the provided partial promotion data.
   * @param id - The ID of the promotion to update.
   * @param promotion - Partial promotion data to update.
   * @returns The updated promotion domain object.
   * @throws {PromotionNotFoundException} If the promotion does not exist.
   * @throws {DuplicateEntryException} If a promotion with a unique field already exists.
   * @throws {PrismaClientKnownRequestError} For other Prisma errors.
   */
  async update(id: string, promotion: Partial<Promotion>): Promise<Promotion> {
    try {
      const promotionWithoutId = { ...promotion };
      delete promotionWithoutId.id;

      const dateSnakeCase = Object.entries(promotionWithoutId).reduce(
        (acc, [key, value]) => {
          const snakeKey = camelCaseToSnakeCase(key);
          acc[snakeKey] = value;
          return acc;
        },
        {} as Record<string, any>,
      );

      return await this.prismaService.promotion
        .update({
          where: { id },
          data: dateSnakeCase,
        })
        .then(PromotionMapper.toDomain);
    } catch (e) {
      if (e instanceof PrismaClientKnownRequestError) {
        if (e.code === 'P2025') {
          throw new PromotionNotFoundException({ id });
        } else if (e.code === 'P2002') {
          throw new DuplicateEntryException(
            'Promotion with provided unique field already exists',
          );
        }
      }
      throw e;
    }
  }

  /**
   * Builds a Prisma where clause object from the provided promotion query filters.
   * @param filters - The filters to apply to the query.
   * @returns A Prisma.PromotionWhereInput object for filtering promotions.
   */
  private buildWhereClause(
    filters?: PromotionQueryFilters,
  ): Prisma.PromotionWhereInput {
    if (!filters) return {};

    const where: Prisma.PromotionWhereInput = {};

    /* ------------------------------ DATE FILTER ------------------------------ */

    if (filters.startDate) {
      where.start_at = { gte: filters.startDate };
    }

    if (filters.endDate) {
      where.end_at = { lte: filters.endDate };
    }

    /* ------------------------------ BOOLEAN FILTER ------------------------------ */

    if (filters.isDeleted !== undefined) {
      where.is_deleted = filters.isDeleted;
    }

    if (filters.isStackable !== undefined) {
      where.is_stackable = filters.isStackable;
    }

    /* ------------------------------ ENUM FILTER ------------------------------ */

    if (filters.applicability?.length) {
      where.applicability = { in: filters.applicability };
    }

    if (filters.status?.length) {
      where.status = { in: filters.status };
    }

    if (filters.discountType?.length) {
      where.discount_type = { in: filters.discountType };
    }

    /* ------------------------------ RANGE FILTER ------------------------------ */

    if (
      filters.priorityMin !== undefined ||
      filters.priorityMax !== undefined
    ) {
      where.priority = {};

      if (filters.priorityMin !== undefined) {
        where.priority.gte = filters.priorityMin;
      }

      if (filters.priorityMax !== undefined) {
        where.priority.lte = filters.priorityMax;
      }
    }

    /* ------------------------------ RELATION FILTER ------------------------------ */

    if (filters.productId) {
      where.promotionProducts = {
        some: {
          product_id: filters.productId,
        },
      };
    }

    if (filters.categoryId) {
      where.promotionCategories = {
        some: {
          category_id: filters.categoryId,
        },
      };
    }

    /* ------------------------------ SEARCH FILTER ------------------------------ */

    if (filters.query) {
      where.OR = [
        { code: { contains: filters.query, mode: 'insensitive' } },
        { title: { contains: filters.query, mode: 'insensitive' } },
        { description: { contains: filters.query, mode: 'insensitive' } },
      ];
    }

    return where;
  }

  /**
   * Updates the status of all active promotions that have expired as of the given date.
   *
   * This method sets the status of all promotions with an `end_at` date greater than or equal to the provided date
   * and a current status of `ACTIVE` to `EXPIRED`. It performs a bulk update using Prisma's `updateMany` method.
   *
   * @param date - The cutoff date. Promotions with `end_at` greater than or equal to this date will be marked as expired.
   * @returns The number of promotions that were updated to `EXPIRED`.
   */
  async updateExpiredPromotions(date: Date): Promise<number> {
    return await this.prismaService.promotion
      .updateMany({
        where: {
          end_at: { gte: date },
          status: PromotionStatus.ACTIVE,
        },
        data: {
          status: PromotionStatus.EXPIRED,
        },
      })
      .then((result) => result.count);
  }

  /**
   * Gets the usage count of a promotion by counting its redemptions in the promotion_redemptions tables.
   *
   * @param promotionId - The ID of the promotion to count redemptions for.
   * @returns The number of times the promotion has been redeemed.
   */
  async getUsageCount(promotionId: string): Promise<number> {
    return this.prismaService.promotionRedemption.count({
      where: { promotion_id: promotionId },
    });
  }
}
