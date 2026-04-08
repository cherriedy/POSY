import { Injectable } from '@nestjs/common';
import { Promotion } from '../types';
import { PromotionRepository } from '../repositories';
import { PromotionApplicability } from '../enums';

@Injectable()
export class CreatePromotionService {
  constructor(private readonly promotionRepository: PromotionRepository) {}

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
