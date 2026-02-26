import { PromotionCategory as DomainPromotionCategory } from './promotion-category.class';
import { PromotionMapper } from './promotion.mapper';
import { CategoryMapper } from '../../categories/types';

import { Prisma } from '@prisma/client';

type PrismaPromotionCategory =
  Prisma.PromotionCategoryGetPayload<{}>;

type PrismaPromotionCategoryWithRelations =
  Prisma.PromotionCategoryGetPayload<{
    include: {
      promotion: true;
      category: true;
    };
  }>;

export class PromotionCategoryMapper {
  static toDomain(
    prisma:
      | PrismaPromotionCategory
      | PrismaPromotionCategoryWithRelations,
  ): DomainPromotionCategory {
    const promotion =
      'promotion' in prisma && prisma.promotion
        ? PromotionMapper.toDomain(prisma.promotion)
        : undefined;

    const category =
      'category' in prisma && prisma.category
        ? CategoryMapper.toDomain(prisma.category)
        : undefined;

    return new DomainPromotionCategory(
      prisma.promotion_id,
      prisma.category_id,
      promotion,
      category,
    );
  }

  static toPrisma(domain: DomainPromotionCategory) {
    return {
      promotion_id: domain.promotionId,
      category_id: domain.categoryId,
    };
  }
}