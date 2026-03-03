import { CreateProductDto } from '../dto';
import { ProductCreatePayload } from '../interfaces';

/**
 * Transformer to convert CreateProductDto to CreateProductPayload.
 * This keeps the controller clean and moves transformation logic to a dedicated layer.
 */
export class CreateProductMapper {
  /**
   * Converts a CreateProductDto to a CreateProductPayload.
   *
   * @param dto - The DTO from the controller layer
   * @returns The payload for the service layer
   */
  static toPayload(dto: CreateProductDto): ProductCreatePayload {
    return {
      categoryId: dto.categoryId,
      sku: dto.sku,
      name: dto.name,
      slug: dto.slug,
      description: dto.description,
      price: dto.price,
      discountType: dto.discountType,
      discountValue: dto.discountValue,
      imageUrl: dto.imageUrl,
      stockQuantity: dto.stockQuantity,
      isAvailable: dto.isAvailable,
      attributes: dto.attributes
        ? {
            cuisineId: dto.attributes.cuisineId,
            mealSession: dto.attributes.mealSession,
            tasteProfile: dto.attributes.tasteProfile,
            dietaryTags: dto.attributes.dietaryTags,
            preparationTime: dto.attributes.preparationTime,
            spiceLevel: dto.attributes.spiceLevel,
            isSeasonal: dto.attributes.isSeasonal,
            season: dto.attributes.season,
          }
        : undefined,
      ingredients: dto.ingredients
        ? dto.ingredients.map((ing) => ({
            ingredientId: ing.ingredientId,
            quantity: ing.quantity,
          }))
        : undefined,
    };
  }
}
