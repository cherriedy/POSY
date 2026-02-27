import { Injectable } from '@nestjs/common';
import { PromotionCategoryRepository, PromotionRepository } from '../repositories';
import { Promotion, PromotionCategory } from '../types';
import { PromotionApplicability, PromotionStatus } from '../enums';
import { PromotionNotFoundException } from '../exceptions';
import { PromotionUnusableException } from '../exceptions/PromotionUnusableException';
import { CategoryRepository } from 'src/models/categories/repositories';
import { CategoriesNotFoundException } from 'src/models/categories/exceptions';
import { DuplicateEntryException, RelatedRecordNotFoundException } from 'src/common/exceptions';
import { FloorsNotFoundException } from 'src/models/floors/exceptions';
import { ZonesNotFoundException } from 'src/models/zones/exceptions';
import { FloorRepository } from 'src/models/floors/repositories';
import { ZoneRepository } from 'src/models/zones/repositories';

@Injectable()
export class UpdatePromotionService {
  constructor(
    private readonly promotionRepository: PromotionRepository,
    private readonly categoryRepository: CategoryRepository,
    private readonly promotionCategoryRepository: PromotionCategoryRepository,
    private readonly floorRepository: FloorRepository,
    private readonly zoneRepository: ZoneRepository,
  ) { }

  async update(id: string, promotion: Partial<Promotion>) {
    // If the promotion is not quantity-based, clear the minQuantity field
    if (promotion.applicability !== PromotionApplicability.QUANTITY_BASED) {
      promotion.minQuantity = null;
    }
    return await this.promotionRepository.update(id, promotion);
  }


  async bulkUpdatePromotionCategories(
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

    return this.promotionCategoryRepository.bulkUpdateByPromotion(promotionId, items);
  }
}
