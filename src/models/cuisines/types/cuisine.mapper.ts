import { Cuisine as PrismaCuisine } from '@prisma/client';
import { Cuisine } from './cuisine.class';
import { MissingRequireFieldsException } from '../../../common/exceptions';

/**
 * Mapper for converting between Prisma and domain Cuisine entities.
 */
export class CuisineMapper {
  /**
   * Converts a Prisma Cuisine entity to a domain Cuisine entity.
   */
  static toDomain(prisma: PrismaCuisine): Cuisine {
    return new Cuisine(
      prisma.id,
      prisma.name,
      prisma.region,
      prisma.created_at,
      prisma.updated_at,
      prisma.is_deleted,
      prisma.deleted_at,
    );
  }

  /**
   * Converts a domain Cuisine entity to a Prisma-compatible data object.
   */
  static toPrisma(
    domain: Cuisine,
  ): Omit<PrismaCuisine, 'id' | 'created_at' | 'updated_at'> {
    if (!domain.name) {
      throw new MissingRequireFieldsException(['name']);
    }

    return {
      name: domain.name,
      region: domain.region,
      is_deleted: domain.isDeleted,
      deleted_at: domain.deletedAt,
    };
  }
}
