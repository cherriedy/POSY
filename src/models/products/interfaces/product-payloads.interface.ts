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
