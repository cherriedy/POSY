import { ProductIngredientBulkUpsertRequestDto } from '../dto';
import {
  ProductIngredientBulkUpsertItemPayload,
  ProductIngredientBulkUpsertPayload,
} from '../interfaces';

/**
 * Mapper for upserting product ingredients.
 *
 * @remarks
 * Converts a controller-layer DTO ({@link ProductIngredientBulkUpsertRequestDto}) and a productId
 * into a service-layer payload ({@link ProductIngredientBulkUpsertPayload}).
 *
 * @example
 * ```ts
 * const payload = UpsertProductIngredientsMapper.toPayload(productId, dto);
 * service.upsert(payload);
 * ```
 */
export class UpsertProductIngredientsMapper {
  /**
   * Maps a DTO and productId to a bulk-upsert payload for the service layer.
   *
   * @param {string} productId - The product's unique identifier from the route parameter.
   * @param {ProductIngredientBulkUpsertRequestDto} dto - The DTO from the controller containing the ingredient list.
   * @returns {ProductIngredientBulkUpsertPayload} The payload for the service layer.
   *
   * @remarks
   * Each ingredient in the payload contains:
   * - `ingredientId`: string — the unique identifier of the ingredient
   * - `quantity`: number — the quantity of the ingredient per product unit
   */
  static toPayload(
    this: void,
    productId: string,
    dto: ProductIngredientBulkUpsertRequestDto,
  ): ProductIngredientBulkUpsertPayload {
    const ingredients: ProductIngredientBulkUpsertItemPayload[] =
      dto.ingredients.map((item) => ({
        ingredientId: item.ingredientId,
        quantity: item.quantity,
      }));

    return { productId, ingredients };
  }
}
