import { BaseRepository } from '@posy/shared';
import { PaginationParams } from '@posy/shared';
import { Promotion } from '../types/promotion';
import { PromotionProduct } from '../types/promotion-product';

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
