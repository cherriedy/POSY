import { ProductIngredient } from '../entities';

export abstract class ProductIngredientRepository {
  abstract findByProductId(productId: string): Promise<ProductIngredient[]>;

  abstract deleteByProductIdAndIngredientId(
    productId: string,
    ingredientId: string,
  ): Promise<void>;

  abstract update(
    id: string,
    entity: Partial<ProductIngredient>,
  ): Promise<ProductIngredient>;

  abstract bulkUpsert(
    productId: string,
    entities: ProductIngredient[],
  ): Promise<ProductIngredient[]>;
}
