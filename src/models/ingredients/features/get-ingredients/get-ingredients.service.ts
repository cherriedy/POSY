import { Injectable } from '@nestjs/common';
import { IngredientRepository } from '../../shared/repositories';
import { Ingredient } from '../../shared/entities';
import { Page } from '../../../../common/interfaces';
import { IngredientNotFoundException } from '../../shared/exceptions';
import { IngredientQueryParams } from '../../shared/interfaces';

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
