import { ProductAttributeUpsertRequestDto } from '../dto';
import { ProductAttributesUpsertPayload } from '../interfaces';

/**
 * Mapper for upserting product attributes.
 *
 * Converts a controller-layer DTO ({@link ProductAttributeUpsertRequestDto}) and a productId
 * into a service-layer payload ({@link ProductAttributesUpsertPayload}).
 *
 * @example
 * ```ts
 * const payload = UpsertAttributesMapper.toPayload(productId, dto);
 * service.upsert(payload);
 * ```
 */
export class UpsertAttributesMapper {
  /**
   * Maps a DTO and productId to an upsert payload for the service layer.
   *
   * @param {string} productId - The product's unique identifier from the route parameter.
   * @param {ProductAttributeUpsertRequestDto} dto - The DTO from the controller containing the attribute data.
   * @returns {ProductAttributesUpsertPayload} The payload for the service layer.
   *
   * @remarks
   * Only includes fields present in the DTO, preserving existing values if omitted.
   */
  static toPayload(
    this: void,
    productId: string,
    dto: ProductAttributeUpsertRequestDto,
  ): ProductAttributesUpsertPayload {
    return {
      productId,
      cuisineId: dto.cuisineId ?? null,
      mealSession: dto.mealSession ?? null,
      tasteProfile: dto.tasteProfile ?? undefined,
      dietaryTags: dto.dietaryTags ?? undefined,
      preparationTime: dto.preparationTime ?? null,
      spiceLevel: dto.spiceLevel ?? null,
      isSeasonal: dto.isSeasonal ?? undefined,
      season: dto.season ?? null,
    };
  }
}
