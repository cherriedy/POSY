import { Injectable } from '@nestjs/common';
import { ProductIngredientRepository } from '../repositories';
import { ProductIngredient } from '../entities';
import { ProductIngredientBulkUpsertPayload } from '../interfaces';

@Injectable()
export class UpsertProductIngredientsService {
  constructor(
    private readonly productIngredientRepository: ProductIngredientRepository,
  ) {}

  async upsert(
    payload: ProductIngredientBulkUpsertPayload,
  ): Promise<ProductIngredient[]> {
    const entities = payload.ingredients.map(
      (item) =>
        new ProductIngredient(
          null,
          payload.productId,
          item.ingredientId,
          item.quantity,
        ),
    );
    return await this.productIngredientRepository.bulkUpsert(
      payload.productId,
      entities,
    );
  }
}
