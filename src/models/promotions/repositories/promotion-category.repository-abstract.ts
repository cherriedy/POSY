import { BaseRepository } from '../../../common/interfaces';
import { Promotion, PromotionCategory } from '../types';

export abstract class PromotionCategoryRepository implements BaseRepository<PromotionCategory> {
  abstract bulkCreate(
    entities: PromotionCategory[],
  ): Promise<PromotionCategory[]>;

  abstract findByPromotionId(promotionId: string): Promise<PromotionCategory[]>;

  abstract getAll(): Promise<PromotionCategory[]>;

  abstract deleteByCategoryIds(
    promotionId: string,
    categoryIds: string[],
  ): Promise<number>;

  abstract findExistingByCategory(
    promotionId: string,
    categoryIds: string[],
  ): Promise<PromotionCategory[]>;

  abstract getPromotionsByCategoryId(
    categoryId: string,
    includeAll?: boolean,
  ): Promise<Promotion[]>;
}
