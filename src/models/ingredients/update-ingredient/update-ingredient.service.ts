import { Injectable } from '@nestjs/common';
import { IngredientRepository } from '../repositories';
import { Ingredient } from '../entities';

@Injectable()
export class UpdateIngredientService {
  constructor(private readonly ingredientRepository: IngredientRepository) {}

  async update(id: string, payload: Partial<Ingredient>): Promise<Ingredient> {
    return await this.ingredientRepository.update(id, payload);
  }
}
