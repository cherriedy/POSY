import { PromotionCategory as PrismaPromotionCategory } from '@prisma/client';
import { PromotionCategory as DomainPromotionCategory } from './promotion-category.class';
import { PromotionMapper } from './promotion.mapper';
import { CategoryMapper } from '../../categories/types';

export class PromotionCategoryMapper {
  static toDomain(
    this: void,
    prisma: PrismaPromotionCategory,
  ): DomainPromotionCategory {
    return new DomainPromotionCategory(
      prisma.id,
      prisma.promotion_id,
      prisma.category_id,

      (prisma as any).promotion
        ? PromotionMapper.toDomain((prisma as any).promotion)
        : undefined,

      (prisma as any).category
        ? CategoryMapper.toDomain((prisma as any).category)
        : undefined
    );
  }

  static toPrisma(domain: DomainPromotionCategory): PrismaPromotionCategory {
    return <PrismaPromotionCategory>{
      ...(domain.id ? { id: domain.id } : {}),
      promotion_id: domain.promotionId,
      category_id: domain.categoryId
    };
  }
}