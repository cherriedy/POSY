import { BaseRepository } from '../../../common/interfaces/base-repository.interface';
import { PaginationParams } from '../../../common/interfaces/pagination-params.interface';
import { Promotion } from '../types/promotion.class';
import { PromotionProduct } from '../types/promotion-product.class';

export abstract class PromotionProductRepository implements BaseRepository<PromotionProduct> {
  // abstract create(entity: PromotionProduct): Promise<PromotionProduct>;

  // abstract delete(id: string): Promise<void>;

  // abstract findById(id: string): Promise<PromotionProduct | null>;

  abstract replaceByProductIds(
    promotionId: string,
    productIds: string[],
  ): Promise<PromotionProduct[]>;

  abstract findByPromotionId(promotionId: string): Promise<PromotionProduct[]>;

  abstract getAll(params?: PaginationParams): Promise<PromotionProduct[]>;

  abstract getPromotionsByProductId(
    productId: string,
    includeAll?: boolean,
  ): Promise<Promotion[]>;
}
