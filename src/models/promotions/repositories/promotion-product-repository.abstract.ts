import { BaseRepository, PaginationParams } from '../../../common/interfaces';
import { Promotion, PromotionProduct } from '../types';

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
