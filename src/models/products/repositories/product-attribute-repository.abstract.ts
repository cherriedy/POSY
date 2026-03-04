import { ProductAttribute } from '../entities';

/**
 * Abstract repository defining the contract for product attribute data access.
 */
export abstract class ProductAttributeRepository {
  /**
   * Finds product attributes by product ID.
   */
  abstract findByProductId(productId: string): Promise<ProductAttribute | null>;

  /**
   * Creates or updates product attributes for a specific product.
   * If attributes already exist for the product, they will be updated.
   * Otherwise, new attributes will be created.
   */
  abstract upsert(entity: Partial<ProductAttribute>): Promise<ProductAttribute>;
}
