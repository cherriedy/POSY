import { ProductIngredient } from './product-ingredient.class';
import {
  ProductIngredient as PrismaProductIngredient,
  Prisma,
} from '@prisma/client';
import { ProductMapper } from './product.mapper';
import { IngredientMapper } from '../../ingredients';

export class ProductIngredientMapper {
  static toDomain(
    this: void,
    prisma: PrismaProductIngredient,
  ): ProductIngredient {
    return new ProductIngredient(
      prisma.id,
      prisma.product_id,
      prisma.ingredient_id,
      Number(prisma.quantity),
      prisma.created_at,
      prisma.updated_at,
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      (prisma as any).product
        ? // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access,@typescript-eslint/no-unsafe-argument
          ProductMapper.toDomain((prisma as any).product)
        : undefined,
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      (prisma as any).ingredient
        ? // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access,@typescript-eslint/no-unsafe-argument
          IngredientMapper.toDomain((prisma as any).ingredient)
        : undefined,
    );
  }

  static toPrisma(
    domain: ProductIngredient,
  ): Omit<PrismaProductIngredient, 'id' | 'created_at' | 'updated_at'> {
    return {
      product_id: domain.productId,
      ingredient_id: domain.ingredientId,
      quantity: new Prisma.Decimal(domain.quantity),
    };
  }
}
