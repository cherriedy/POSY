import { Promotion } from './promotion';
import { Product } from '@posy/products/entities/product';

export class PromotionProduct {
  constructor(
    public readonly id: string | null,
    public readonly promotionId: string,
    public readonly productId: string,
    public readonly promotion?: Promotion,
    public readonly product?: Product,
  ) {}
}
