import { Product } from './product';
import { Ingredient } from 'src/models/ingredients/shared/entities/ingredient';

export class ProductIngredient {
  constructor(
    public id: string | null = null,
    public productId: string,
    public ingredientId: string,
    public quantity: number = 0,
    public createdAt: Date | null = null,
    public updatedAt: Date | null = null,
    public product: Product | null = null,
    public ingredient: Ingredient | null = null,
  ) {}
}
