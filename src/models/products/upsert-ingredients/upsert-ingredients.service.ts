import { Injectable } from '@nestjs/common';
import { ProductIngredientRepository, ProductRepository } from '../repositories';
import { ProductIngredient } from '../entities';
import { ProductIngredientBulkUpsertPayload } from '../interfaces';
import { ProductNotFoundException } from '../exceptions';

@Injectable()
export class UpsertIngredientsService {
  constructor(
    private readonly productIngredientRepository: ProductIngredientRepository,
    private readonly productRepository: ProductRepository,
  ) {}

  async upsert(
    payload: ProductIngredientBulkUpsertPayload,
  ): Promise<ProductIngredient[]> {

    const product = await this.productRepository.findById(payload.productId);
    if (!product) throw new ProductNotFoundException(payload.productId);

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
