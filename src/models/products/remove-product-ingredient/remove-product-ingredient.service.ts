import { Inject, Injectable } from '@nestjs/common';
import { ProductIngredientRepository } from 'src/models/products/repositories/product-ingredient-repository.abstract';
import {
  ProductIngredientBulkRemovePayload,
  ProductIngredientBulkDeleteResultItem,
} from '../interfaces';
import { ProductIngredientNotFoundException } from '../exceptions';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';

@Injectable()
export class RemoveProductIngredientService {
  @Inject(WINSTON_MODULE_PROVIDER)
  private readonly logger: import('winston').Logger;

  constructor(
    private readonly productIngredientRepository: ProductIngredientRepository,
  ) {}

  /**
   * Removes ingredients from a product one-by-one using individual transactions.
   * Returns a per-item result: each ingredient is either deleted or failed.
   *
   * @param payload - Contains productId and array of ingredientIds to remove.
   * @returns Per-item result array with status and optional error per ingredient.
   */
  async bulkDelete(
    payload: ProductIngredientBulkRemovePayload,
  ): Promise<ProductIngredientBulkDeleteResultItem[]> {
    const results: ProductIngredientBulkDeleteResultItem[] = [];

    for (const associateId of payload.associationIds) {
      try {
        await this.productIngredientRepository.delete(associateId);
        results.push({ id: associateId, status: 'SUCCEED' });
      } catch (e) {
        let error = 'Unknown error occurred';
        if (e instanceof ProductIngredientNotFoundException) {
          error = e.message;
        } else if (e instanceof Error) {
          this.logger.error(e.message);
        }
        results.push({ id: associateId, status: 'FAILED', error });
      }
    }

    return results;
  }
}
