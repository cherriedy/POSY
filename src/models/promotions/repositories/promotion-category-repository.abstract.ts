import { BaseRepository } from '../../../common/interfaces/base-repository.interface';
import { Promotion } from '../types/promotion.class';
import { PromotionCategory } from '../types/promotion-category.class';

export abstract class PromotionCategoryRepository implements BaseRepository<PromotionCategory> {
  abstract replaceByCategoryIds(
    promotionId: string,
    categoryIds: string[],
  ): Promise<PromotionCategory[]>;

  abstract findByPromotionId(promotionId: string): Promise<PromotionCategory[]>;

  abstract getAll(): Promise<PromotionCategory[]>;

  abstract deleteByCategoryIds(
    promotionId: string,
    categoryIds: string[],
  ): Promise<number>;

  abstract getPromotionsByCategoryId(
    categoryId: string,
    includeAll?: boolean,
  ): Promise<Promotion[]>;
}
