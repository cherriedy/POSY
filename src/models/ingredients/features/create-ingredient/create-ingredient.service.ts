import { Injectable } from '@nestjs/common';
import { IngredientRepository } from '../../shared/repositories';
import { Ingredient } from '../../shared/entities';
import { CreateIngredientPayload } from './create-ingredient.payload';

@Injectable()
export class CreateIngredientService {
  constructor(private readonly ingredientRepository: IngredientRepository) {}

  async create(payload: CreateIngredientPayload): Promise<Ingredient> {
    const ingredient = new Ingredient(
      null,
      payload.vendorId,
      payload.unitId,
      payload.name,
      payload.stock,
      payload.minStock,
      payload.unitCost,
      payload.expiredAt ?? null,
      null,
      null,
    );

    return await this.ingredientRepository.create(ingredient);
  }
}
