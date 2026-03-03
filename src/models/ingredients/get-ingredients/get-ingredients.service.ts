import { Injectable } from '@nestjs/common';
import { IngredientRepository } from '../repositories';
import { Ingredient } from '../entities';
import { Page } from '../../../common/interfaces';
import { IngredientNotFoundException } from '../exceptions';
import { IngredientQueryParams } from '../interfaces';

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
