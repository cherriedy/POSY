import { PromotionProduct as PrismaPromotionProduct } from '@prisma/client';
import { PromotionProduct as DomainPromotionProduct } from './promotion-product.class';
import { PromotionMapper } from './promotion.mapper';
import { ProductMapper } from 'src/models/products/types';

export class PromotionProductMapper {
  static toDomain(
    this: void,
    prisma: PrismaPromotionProduct,
  ): DomainPromotionProduct {
    return new DomainPromotionProduct(
      prisma.id,
      prisma.promotion_id,
      prisma.product_id,

      (prisma as any).promotion
        ? PromotionMapper.toDomain((prisma as any).promotion)
        : undefined,

      (prisma as any).product
        ? ProductMapper.toDomain((prisma as any).product)
        : undefined
    );
  }

  static toPrisma(domain: DomainPromotionProduct): PrismaPromotionProduct {
    return <PrismaPromotionProduct>{
      ...(domain.id ? { id: domain.id } : {}),
      promotion_id: domain.promotionId,
      product_id: domain.productId
    };
  }
}