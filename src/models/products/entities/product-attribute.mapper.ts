import { ProductAttribute as PrismaProductAttribute } from '@prisma/client';
import { ProductAttribute } from './product-attribute.class';
import { MealSession, Taste, DietaryTag, Season } from '../enums';
import { CuisineMapper } from '../../cuisines/types';

/**
 * Mapper for converting between Prisma and domain ProductAttribute entities.
 */
export class ProductAttributeMapper {
  /**
   * Converts a Prisma ProductAttribute entity to a domain ProductAttribute entity.
   */
  static toDomain(prisma: PrismaProductAttribute): ProductAttribute {
    return new ProductAttribute(
      prisma.id,
      prisma.product_id,
      prisma.cuisine_id,
      prisma.meal_session as MealSession | null,
      (prisma.taste_profile as Taste[]) ?? [],
      (prisma.dietary_tags as DietaryTag[]) ?? [],
      prisma.preparation_time,
      prisma.spice_level,
      prisma.is_seasonal,
      prisma.season as Season | null,
      prisma.created_at,
      prisma.updated_at,
      // Relations
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      (prisma as any).cuisine
        ? // eslint-disable-next-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-member-access
          CuisineMapper.toDomain((prisma as any).cuisine)
        : null,
    );
  }

  /**
   * Converts a domain ProductAttribute entity to a Prisma-compatible data object.
   */
  static toPrisma(
    domain: ProductAttribute,
  ): Omit<
    PrismaProductAttribute,
    'id' | 'cuisine' | 'created_at' | 'updated_at'
  > {
    return {
      cuisine_id: domain.cuisineId,
      product_id: domain.productId,
      meal_session: domain.mealSession,
      taste_profile: domain.tasteProfile,
      dietary_tags: domain.dietaryTags,
      preparation_time: domain.preparationTime,
      spice_level: domain.spiceLevel,
      is_seasonal: domain.isSeasonal,
      season: domain.season,
    };
  }
}
