import { Injectable } from '@nestjs/common';
import { IngredientRepository } from '../../shared/repositories/ingredient-repository.abstract';
import { Ingredient } from '../../shared/entities/ingredient';
import { Page } from '@posy/shared';
import { IngredientNotFoundException } from '../../shared/exceptions/ingredient-not-found.exception';
import { IngredientQueryParams } from '../../shared/interfaces/ingredient-query-params.interface';

@Injectable()
export class GetIngredientsService {
  constructor(private readonly ingredientRepository: IngredientRepository) {}

  async getAll(params: IngredientQueryParams): Promise<Page<Ingredient>> {
    return await this.ingredientRepository.getAllPaged(params);
  }

  async getById(id: string): Promise<Ingredient> {
    const result = await this.ingredientRepository.findById(id);
    if (!result) throw new IngredientNotFoundException(id);
    return result;
  }
}
