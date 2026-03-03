/**
 * Payload for creating a product with optional attributes.
 * This is the contract between the controller and service layer.
 */
export interface ProductCreatePayload {
  categoryId: string;
  sku?: string;
  name: string;
  slug?: string;
  description?: string;
  price: number;
  discountType?: string;
  discountValue?: number;
  imageUrl?: string;
  stockQuantity?: number;
  isAvailable?: boolean;
  attributes?: ProductAttributesCreatePayload;
  ingredients?: ProductIngredientCreatePayload[];
}

/**
 * Payload for creating product attributes.
 */
export interface ProductAttributesCreatePayload {
  cuisineId?: string | null;
  mealSession?: string | null;
  tasteProfile?: string[];
  dietaryTags?: string[];
  preparationTime?: number | null;
  spiceLevel?: number | null;
  isSeasonal?: boolean;
  season?: string | null;
}

/**
 * Payload for adding a single ingredient to a product.
 */
export interface ProductIngredientCreatePayload {
  ingredientId: string;
  quantity: number;
}

/**
 * A single item in a bulk ingredient upsert payload.
 */
export interface ProductIngredientBulkUpsertItemPayload {
  ingredientId: string;
  quantity: number;
}

/**
 * Shared payload for bulk-adding or bulk-replacing all ingredients of a product.
 * This is the contract between the controller and the service layer.
 */
export interface ProductIngredientBulkUpsertPayload {
  productId: string;
  ingredients: ProductIngredientBulkUpsertItemPayload[];
}
