import { Injectable } from '@nestjs/common';
import { IngredientRepository } from '../../shared/repositories/ingredient-repository.abstract';
import { Ingredient } from '../../shared/entities/ingredient';
import { IngredientNotFoundException } from '../../shared/errors/ingredient-not-found.exception';

@Injectable()
export class UpdateIngredientService {
  constructor(private readonly ingredientRepository: IngredientRepository) {}

  async update(id: string, payload: Partial<Ingredient>): Promise<Ingredient> {
    const result = await this.ingredientRepository.findById(id);
    if (!result) throw new IngredientNotFoundException(id);
    return await this.ingredientRepository.update(id, payload);
  }
}
