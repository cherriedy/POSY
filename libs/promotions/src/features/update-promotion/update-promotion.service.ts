import { Injectable } from '@nestjs/common';
import { PromotionRepository } from '../../shared/repositories/promotion-repository.abstract';
import { Promotion } from '../../shared/entities/promotion';
import { PromotionApplicability } from '../../shared/enums/promotion-applicability.enum';

@Injectable()
export class UpdatePromotionService {
  constructor(private readonly promotionRepository: PromotionRepository) {}

  async update(id: string, promotion: Partial<Promotion>) {
    // If the promotion is not quantity-based, clear the minQuantity field
    if (promotion.applicability !== PromotionApplicability.QUANTITY_BASED) {
      promotion.minQuantity = null;
    }
    return await this.promotionRepository.update(id, promotion);
  }
}
