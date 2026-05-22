import { Injectable } from '@nestjs/common';
import { PromotionCategoryRepository } from '../repositories/promotion-category-repository.abstract';
import { PromotionRepository } from '../repositories/promotion-repository.abstract';
import { Promotion } from '../types/promotion.class';
import { PromotionCategory } from '../types/promotion-category.class';
import { PromotionApplicability } from '../enums/promotion-applicability.enum';
import { PromotionNotFoundException } from '../exceptions/PromotionNotFoundException';
import { PromotionUnusableException } from '../exceptions/PromotionUnusableException';
import { DuplicateEntryException } from 'src/common/exceptions/DuplicateEntryException';
import { CategoriesNotFoundException } from 'src/models/categories/shared/exceptions/category-not-found.exception';
import { CategoryRepository } from 'src/models/categories/shared/repositories/category-repository.abstract';

@Injectable()
export class ReplacePromotionCategoriesService {
  constructor(
    private readonly promotionRepository: PromotionRepository,
    private readonly categoryRepository: CategoryRepository,
    private readonly promotionCategoryRepository: PromotionCategoryRepository,
  ) {}

  async replacePromotionCategories(
    promotionId: string,
    categoryIds: string[],
  ): Promise<PromotionCategory[]> {
    const promotion = await this.promotionRepository.findById(promotionId);

    if (!promotion || promotion.isDeleted) {
      throw new PromotionNotFoundException({ id: promotionId });
    }

    if (
      promotion.applicability !== PromotionApplicability.SPECIFIC_CATEGORIES
    ) {
      throw new PromotionUnusableException(
        promotionId,
        'Promotion applicability does not allow categories.',
        { applicability: promotion.applicability },
      );
    }

    const duplicateCategoryIds = categoryIds.filter(
      (id, index, arr) => arr.indexOf(id) !== index,
    );

    if (duplicateCategoryIds.length > 0) {
      throw new DuplicateEntryException('Duplicate categoryIds in request.', {
        duplicateCategoryIds: [...new Set(duplicateCategoryIds)],
      });
    }

    const uniqueCategoryIds = [...new Set(categoryIds)];

    const categories =
      await this.categoryRepository.findByIds(uniqueCategoryIds);

    if (categories.length !== uniqueCategoryIds.length) {
      throw new CategoriesNotFoundException({
        missingIds: uniqueCategoryIds.filter(
          (id) => !categories.some((c) => c.id === id),
        ),
      });
    }

    return await this.promotionCategoryRepository.replaceByCategoryIds(
      promotionId,
      uniqueCategoryIds,
    );
  }
}
