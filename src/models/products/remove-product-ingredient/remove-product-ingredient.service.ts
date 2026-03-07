import { Injectable } from '@nestjs/common';
import { ProductIngredientRepository } from '../repositories';
import { ProductIngredientBulkRemovePayload } from '../interfaces';

@Injectable()
export class RemoveProductIngredientService {
  constructor(
    private readonly productIngredientRepository: ProductIngredientRepository,
  ) {}

  async bulkRemove(payload: ProductIngredientBulkRemovePayload): Promise<void> {
    await this.productIngredientRepository.bulkDeleteByProductIdAndIngredientIds(
      payload.productId,
      payload.ingredientIds,
    );
  }
}
