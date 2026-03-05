import { BadRequestException, Injectable } from '@nestjs/common';
import { Promotion, PromotionCategory, PromotionProduct } from '../types';
import {
  PromotionCategoryRepository,
  PromotionProductRepository,
  PromotionRepository,
} from '../repositories';
import { PromotionApplicability } from '../enums';
import { CategoryRepository } from '../../categories/repositories';
import { ProductRepository } from '../../products/repositories';
import { FloorRepository } from 'src/models/floors/repositories';
import { ZoneRepository } from 'src/models/zones/repositories';

@Injectable()
export class CreatePromotionService {
  constructor(
    private readonly promotionRepository: PromotionRepository,
  ) {}

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
}
