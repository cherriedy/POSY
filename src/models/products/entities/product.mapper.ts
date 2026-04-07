import { Prisma, Product as PrismaProduct } from '@prisma/client';
import { Product as DomainProduct } from './product.class';
import { ProductDiscountType } from '../enums';
import { CategoryMapper } from '../../categories/shared/entities';
import { ProductAttributeMapper } from './product-attribute.mapper';
import { ProductIngredientMapper } from './product-ingredient.mapper';

export class ProductMapper {
  static toDomain(this: void, prisma: PrismaProduct): DomainProduct {
    const p = prisma as any; // eslint-disable-line @typescript-eslint/no-unsafe-assignment

    return new DomainProduct(
      prisma.id,
      prisma.category_id,
      prisma.sku,
      prisma.name,
      prisma.slug,
      prisma.description,
      prisma.price.toNumber(),
      prisma.discount_type
        ? (prisma.discount_type as ProductDiscountType)
        : null,
      prisma.discount_value !== undefined && prisma.discount_value !== null
        ? prisma.discount_value.toNumber()
        : null,
      prisma.image_url,
      prisma.stock_quantity,
      prisma.is_available,
      prisma.is_deleted,
      prisma.deleted_at,
      prisma.created_at,
      prisma.updated_at,
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access,@typescript-eslint/no-unsafe-argument
      p.category ? CategoryMapper.toDomain(p.category) : undefined,
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      p.productAttribute !== undefined
        ? // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
          p.productAttribute
          ? // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access,@typescript-eslint/no-unsafe-argument
            ProductAttributeMapper.toDomain(p.productAttribute)
          : null
        : undefined,
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      p.productIngredients !== undefined
        ? // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
          (p.productIngredients as any[]).map(ProductIngredientMapper.toDomain)
        : undefined,
    );
  }

  static toPrisma(domain: DomainProduct): Prisma.ProductCreateInput {
    if (!domain.categoryId) {
      throw new Error('categoryId is required');
    }

    return {
      sku: domain.sku,
      name: domain.name,
      slug: domain.slug ?? '',
      description: domain.description,
      price: new Prisma.Decimal(domain.price),
      discount_type: domain.discountType,
      discount_value:
        domain.discountValue !== null
          ? new Prisma.Decimal(domain.discountValue)
          : null,

      image_url: domain.imageUrl,
      stock_quantity: domain.stockQuantity,
      is_available: domain.isAvailable,
      is_deleted: domain.isDeleted,
      deleted_at: domain.deletedAt,
      category: {
        connect: { id: domain.categoryId },
      },
    };
  }
}
