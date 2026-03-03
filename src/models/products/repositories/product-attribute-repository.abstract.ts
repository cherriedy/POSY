import { ProductAttribute } from '../entities';

/**
 * Abstract repository defining the contract for product attribute data access.
 */
export abstract class ProductAttributeRepository {
  /**
   * Creates product attributes for a product.
   */
  abstract create(entity: ProductAttribute): Promise<ProductAttribute>;

  /**
   * Finds product attributes by product ID.
   */
  abstract findByProductId(productId: string): Promise<ProductAttribute | null>;

  /**
   * Updates product attributes.
   */
  abstract update(
    productId: string,
    entity: Partial<ProductAttribute>,
  ): Promise<ProductAttribute>;
}
