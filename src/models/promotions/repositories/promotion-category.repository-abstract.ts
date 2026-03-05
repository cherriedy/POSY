import { BaseRepository } from '../../../common/interfaces';
import { Promotion, PromotionCategory } from '../types';

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
