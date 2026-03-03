import { Injectable } from '@nestjs/common';
import {
  PromotionCategoryRepository,
  PromotionProductRepository,
  PromotionRepository,
} from '../repositories';
import { PromotionNotFoundException } from '../exceptions';
import { CategoryRepository } from 'src/models/categories/repositories';
import { CategoriesNotFoundException } from 'src/models/categories/exceptions';
import { RelatedRecordNotFoundException } from 'src/common/exceptions';
import { ProductsNotFoundException } from 'src/models/products/exceptions';
import { ProductRepository } from 'src/models/products/repositories';

@Injectable()
export class DeletePromotionService {
  constructor(
    private readonly promotionRepository: PromotionRepository,
    private readonly promotionCategoryRepository: PromotionCategoryRepository,
    private readonly promotionProductRepository: PromotionProductRepository,
    private readonly categoryRepository: CategoryRepository,
    private readonly productRepository: ProductRepository,
  ) {}

  /**
   * Deletes a promotion by its ID.
   *
   * Finds the promotion by the given ID. If the promotion does not exist or is already deleted,
   * the method returns without performing any action. Otherwise, it deletes the promotion.
   *
   * @param {string} id - The unique identifier of the promotion to delete.
   * @returns {Promise<void>} Resolves when the operation is complete.
   */
  async delete(id: string): Promise<void> {
    const promotion = await this.promotionRepository.findById(id);
    if (!promotion || (promotion && promotion.isDeleted)) return;
    await this.promotionRepository.delete(id);
  }

  async deletePromotionCategoriesByCategoryIds(
    promotionId: string,
    categoryIds: string[],
  ): Promise<void> {
    // Validate promotion
    const promotion = await this.promotionRepository.findById(promotionId);

    if (!promotion || promotion.isDeleted) {
      throw new PromotionNotFoundException({ id: promotionId });
    }

    // Validate categories
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

    // Validate that the categories are linked to the promotion
    const existing =
      await this.promotionCategoryRepository.findExistingByCategory(
        promotionId,
        uniqueCategoryIds,
      );

    if (!existing.length) {
      throw new RelatedRecordNotFoundException(
        'None of the provided categories belong to this promotion.',
      );
    }

    if (existing.length !== uniqueCategoryIds.length) {
      const existingIds = existing.map((e) => e.categoryId);

      const notLinked = uniqueCategoryIds.filter(
        (id) => !existingIds.includes(id),
      );

      throw new RelatedRecordNotFoundException(
        'Some categories are not attached to this promotion.',
        notLinked,
      );
    }

    await this.promotionCategoryRepository.deleteByCategoryIds(
      promotionId,
      categoryIds,
    );
  }

  async deletePromotionProductsByProductIds(
    promotionId: string,
    productIds: string[],
  ): Promise<void> {
    // Validate promotion
    const promotion = await this.promotionRepository.findById(promotionId);

    if (!promotion || promotion.isDeleted) {
      throw new PromotionNotFoundException({ id: promotionId });
    }

    // Validate product
    const uniqueProductIds = [...new Set(productIds)];

    const products = await this.productRepository.findByIds(uniqueProductIds);

    if (products.length !== uniqueProductIds.length) {
      throw new ProductsNotFoundException({
        missingIds: uniqueProductIds.filter(
          (id) => !products.some((c) => c.id === id),
        ),
      });
    }

    // Validate that the products are linked to the promotion
    const existing =
      await this.promotionProductRepository.findExistingByProduct(
        promotionId,
        uniqueProductIds,
      );

    if (!existing.length) {
      throw new RelatedRecordNotFoundException(
        'None of the provided categories belong to this promotion.',
      );
    }

    if (existing.length !== uniqueProductIds.length) {
      const existingIds = existing.map((e) => e.productId);

      const notLinked = uniqueProductIds.filter(
        (id) => !existingIds.includes(id),
      );

      throw new RelatedRecordNotFoundException(
        'Some products are not attached to this promotion.',
        notLinked,
      );
    }

    await this.promotionProductRepository.deleteByProductIds(
      promotionId,
      productIds,
    );
  }

  /**
   * Deletes a promotion product by its ID.
   *
   * This method removes the promotion product associated with the provided unique identifier.
   * If the product does not exist, the repository is expected to handle the case gracefully.
   *
   * @param {string} id - The unique identifier of the promotion product to delete.
   * @returns {Promise<void>} Resolves when the deletion operation is complete.
   */
  // async deletePromotionProduct(id: string): Promise<void> {
  //   await this.promotionProductRepository.delete(id);
  // }
}
