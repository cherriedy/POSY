import { Injectable } from '@nestjs/common';
import {
  PromotionRepository,
} from '../repositories';

@Injectable()
export class DeletePromotionService {
  constructor(
    private readonly promotionRepository: PromotionRepository,
  ) { }

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
}
