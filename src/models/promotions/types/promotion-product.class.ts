import { Promotion } from './promotion.class';
import { Product } from 'src/models/products/entities';

export class PromotionProduct {
  constructor(
    public readonly id: string | null,
    public readonly promotionId: string,
    public readonly productId: string,
    public readonly promotion?: Promotion,
    public readonly product?: Product,
  ) {}
}
