import { Injectable } from '@nestjs/common';
import { IngredientRepository } from '../repositories';
import { Ingredient } from '../entities';
import { IngredientNotFoundException } from '../exceptions';

@Injectable()
export class UpdateIngredientService {
  constructor(private readonly ingredientRepository: IngredientRepository) { }

  async update(id: string, payload: Partial<Ingredient>): Promise<Ingredient> {
    const result = await this.ingredientRepository.findById(id);
    if (!result) throw new IngredientNotFoundException(id);
    return await this.ingredientRepository.update(id, payload);
  }
}
