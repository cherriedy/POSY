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
import { ProductNotFoundException } from '../../products/exceptions';
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
    items: {
      categoryId: string;
      floorId?: string;
      zoneId?: string;
    }[],
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
    const categoryIds = [...new Set(items.map(i => i.categoryId))];

    const categories = await this.categoryRepository.findByIds(categoryIds);

    if (categories.length !== categoryIds.length) {
      throw new CategoriesNotFoundException({
        missingIds: categoryIds.filter(
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

    // Collect floor + zone ids
    const floorIds = [
      ...new Set(items.filter(i => i.floorId).map(i => i.floorId!)),
    ];

    const zoneIds = [
      ...new Set(items.filter(i => i.zoneId).map(i => i.zoneId!)),
    ];

    // Check floors exist
    if (floorIds.length) {
      const floors = await this.floorRepository.findByIds(floorIds);

      if (floors.length !== floorIds.length) {
        throw new FloorsNotFoundException({
          missingIds: floorIds.filter(
            id => !floors.some(f => f.id === id),
          ),
        });
      }
    }

    // Check zones exist
    let zones: any[] = [];
    if (zoneIds.length) {
      zones = await this.zoneRepository.findByIds(zoneIds);

      if (zones.length !== zoneIds.length) {
        throw new ZonesNotFoundException({
          missingIds: zoneIds.filter(
            id => !zones.some(z => z.id === id),
          ),
        });
      }
    }

    // Check zone belongs to floor (nếu có cả 2)
    for (const item of items) {
      if (item.zoneId && item.floorId) {
        const zone = zones.find(z => z.id === item.zoneId);

        if (zone && zone.floorId !== item.floorId) {
          throw new RelatedRecordNotFoundException(
            `Zone ${item.zoneId} does not belong to floor ${item.floorId}`,
          );
        }
      }
    }

    // Prevent duplicate in same request
    const uniqueCategoryIds = new Set(
      items.map(i => i.categoryId),
    );

    if (uniqueCategoryIds.size !== items.length) {
      throw new DuplicateEntryException(
        'Duplicate categoryId in request is not allowed.',
      );
    }

    // Create entities
    const entities: PromotionCategory[] = items.map((item) => ({
      id: null,
      promotionId,
      categoryId: item.categoryId,
      floorId: item.floorId ?? null,
      zoneId: item.zoneId ?? null,
    }));

    return this.promotionCategoryRepository.bulkCreate(entities);
  }

  /**
   * Creates a new promotion-product association after validating the product and promotion.
   * Throws an exception if the product or promotion does not exist, is deleted, is not active,
   * or if the promotion's applicability does not allow adding products.
   *
   * @param {PromotionProduct} promotionProduct - The promotion-product association to create.
   * @returns {Promise<PromotionProduct>} The created promotion-product association.
   * @throws {ProductNotFoundException} If the product does not exist.
   * @throws {PromotionNotFoundException} If the promotion does not exist or is deleted.
   * @throws {PromotionUnusableException} If the promotion is not active or applicability is invalid.
   */
  async createPromotionProduct(
    promotionProduct: PromotionProduct,
  ): Promise<PromotionProduct> {
    const product = await this.productRepository.findById(
      promotionProduct.productId,
    );

    // Validate that the product exists
    if (!product) {
      throw new ProductNotFoundException(promotionProduct.productId);
    }

    const promotion = await this.promotionRepository.findById(
      promotionProduct.promotionId,
    );

    // Validate that the promotion exists
    if (!promotion || promotion.isDeleted) {
      throw new PromotionNotFoundException({
        id: promotionProduct.promotionId,
      });
    }
    // Validate that the promotion is ACTIVE
    if (promotion.status !== PromotionStatus.ACTIVE) {
      throw new PromotionUnusableException(
        promotionProduct.promotionId,
        'Promotion is not active.',
      );
    }
    // Validate that the promotion applicability is SPECIFIC_ITEMS
    if (promotion.applicability !== PromotionApplicability.SPECIFIC_ITEMS) {
      throw new PromotionUnusableException(
        promotionProduct.promotionId,
        'Promotion applicability does not allow adding products.',
        { applicability: promotion.applicability },
      );
    }

    return await this.promotionProductRepository.create(promotionProduct);
  }
}
