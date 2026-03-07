import { DietaryTag, MealSession, Season, Taste } from '../enums';

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
  attributes?: ProductAttributesUpsertPayload;
  ingredients?: ProductIngredientBulkUpsertItemPayload[];
}

/**
 * Payload for upserting product attributes.
 */
export interface ProductAttributesUpsertPayload {
  productId?: string;
  cuisineId?: string | null;
  mealSession?: MealSession | null;
  tasteProfile?: Taste[];
  dietaryTags?: DietaryTag[];
  preparationTime?: number | null;
  spiceLevel?: number | null;
  isSeasonal?: boolean;
  season?: Season | null;
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

/**
 * Payload for bulk-removing ingredients from a product.
 */
export interface ProductIngredientBulkRemovePayload {
  productId: string;
  ingredientIds: string[];
}
