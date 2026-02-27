import { BadRequestException, Injectable } from '@nestjs/common';
import { Promotion, PromotionCategory, PromotionProduct } from '../types';
import {
  PromotionCategoryRepository,
  PromotionProductRepository,
  PromotionRepository,
} from '../repositories';
import { PromotionApplicability, PromotionStatus } from '../enums';
import { CategoriesNotFoundException } from '../../categories/exceptions';
import { CategoryRepository } from '../../categories/repositories';
import { PromotionNotFoundException } from '../exceptions';
import { ProductRepository } from '../../products/repositories';
import { ProductsNotFoundException } from '../../products/exceptions';
import { PromotionUnusableException } from '../exceptions/PromotionUnusableException';
import { FloorRepository } from 'src/models/floors/repositories';
import { ZoneRepository } from 'src/models/zones/repositories';
import { FloorsNotFoundException } from 'src/models/floors/exceptions';
import { ZonesNotFoundException } from 'src/models/zones/exceptions';
import { DuplicateEntryException, RelatedRecordNotFoundException } from 'src/common/exceptions';

@Injectable()
export class CreatePromotionService {
  constructor(
    private readonly promotionRepository: PromotionRepository,
    private readonly promotionCategoryRepository: PromotionCategoryRepository,
    private readonly categoryRepository: CategoryRepository,
    private readonly promotionProductRepository: PromotionProductRepository,
    private readonly productRepository: ProductRepository,
    private readonly floorRepository: FloorRepository,
    private readonly zoneRepository: ZoneRepository,
  ) { }

  /**
   * Creates a new promotion. If the promotion is not quantity-based, clears the minQuantity field.
   * @param promotion - The promotion domain object to create.
   * @returns The created promotion domain object.
   */
  async create(promotion: Promotion) {
    // If the promotion is not quantity-based, clear the minQuantity field
    if (promotion.applicability !== PromotionApplicability.QUANTITY_BASED) {
      promotion.minQuantity = null;
    }
    return await this.promotionRepository.create(promotion);
  }

  /**
   * Bulk creates promotion-category associations for a given promotion.
   * Validates the promotion, categories, floors, and zones before creation.
   * Throws exceptions if any validation fails, including duplicate entries or related record issues.
   * @param promotionId - The ID of the promotion to associate categories with.
   * @param items - An array of objects containing categoryId, floorId, and zoneId for each association.
   * @return An array of created PromotionCategory domain objects.
   * @throws {PromotionNotFoundException} If the promotion does not exist or is deleted.
   * @throws {PromotionUnusableException} If the promotion is not active or has invalid applicability.
   * @throws {CategoriesNotFoundException} If any of the specified categories do not exist.
   * @throws {FloorsNotFoundException} If any of the specified floors do not exist.
   * @throws {ZonesNotFoundException} If any of the specified zones do not exist.
   * @throws {DuplicateEntryException} If there are duplicate category-floor-zone combinations.
   * @throws {RelatedRecordNotFoundException} If a specified zone does not belong to the specified floor.
   */
  async bulkCreatePromotionCategories(
    promotionId: string,
    categoryIds: string[],
  ): Promise<PromotionCategory[]> {
    // Check promotion
    const promotion = await this.promotionRepository.findById(promotionId);

    if (!promotion || promotion.isDeleted) {
      throw new PromotionNotFoundException({ id: promotionId });
    }

    if (promotion.status !== PromotionStatus.ACTIVE) {
      throw new PromotionUnusableException(
        promotionId,
        'Promotion is not active.',
      );
    }

    if (
      promotion.applicability !== PromotionApplicability.SPECIFIC_CATEGORIES
    ) {
      throw new PromotionUnusableException(
        promotionId,
        'Promotion applicability does not allow adding categories.',
        { applicability: promotion.applicability },
      );
    }

    // Check categories
    const uniqueCategoryIds = [...new Set(categoryIds)];

    const categories =
      await this.categoryRepository.findByIds(uniqueCategoryIds);

    if (categories.length !== uniqueCategoryIds.length) {
      throw new CategoriesNotFoundException({
        missingIds: uniqueCategoryIds.filter(
          id => !categories.some(c => c.id === id),
        ),
      });
    }

    const existing =
      await this.promotionCategoryRepository.findExistingByCategory(
        promotionId,
        categoryIds,
      );

    if (existing.length) {
      throw new DuplicateEntryException(
        'Some categories already attached to this promotion.',
        {
          duplicatedCategoryIds: existing.map(e => e.categoryId),
        },
      );
    }
    // Create entities
    const entities: PromotionCategory[] = categoryIds.map((categoryId) => ({
      id: null,
      promotionId,
      categoryId,
    }));

    return this.promotionCategoryRepository.bulkCreate(entities);
  }

  async bulkCreatePromotionProducts(
    promotionId: string,
    productIds: string[]
  ): Promise<PromotionProduct[]> {
    // Check promotion
    const promotion = await this.promotionRepository.findById(promotionId);

    if (!promotion || promotion.isDeleted) {
      throw new PromotionNotFoundException({ id: promotionId });
    }

    if (promotion.status !== PromotionStatus.ACTIVE) {
      throw new PromotionUnusableException(
        promotionId,
        'Promotion is not active.',
      );
    }

    if (
      promotion.applicability !== PromotionApplicability.SPECIFIC_ITEMS
    ) {
      throw new PromotionUnusableException(
        promotionId,
        'Promotion applicability does not allow adding products.',
        { applicability: promotion.applicability },
      );
    }

    // Check products
    const uniqueProductIds = [...new Set(productIds)];

    const products =
      await this.productRepository.findByIds(uniqueProductIds);
    if (products.length !== uniqueProductIds.length) {
      throw new ProductsNotFoundException({
        missingIds: uniqueProductIds.filter(
          id => !products.some(p => p.id === id),
        ),
      });
    }

    const existing =
      await this.promotionProductRepository.findExistingByProduct(
        promotionId,
        productIds,
      );

    if (existing.length) {
      throw new DuplicateEntryException(
        'Some products already attached to this promotion.',
        {
          duplicatedProductIds: existing.map(e => e.productId),
        },
      );
    }
    
    // Create entities
    const entities: PromotionProduct[] = productIds.map((productId) => ({
      id: null,
      promotionId,
      productId,
    }));

    return this.promotionProductRepository.bulkCreate(entities);
  }

}
