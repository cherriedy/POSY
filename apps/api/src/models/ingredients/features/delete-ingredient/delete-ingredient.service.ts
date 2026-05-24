import { Injectable } from '@nestjs/common';
import { IngredientRepository } from '../../shared/repositories/ingredient-repository.abstract';
import { IngredientNotFoundException } from '../../shared/exceptions/ingredient-not-found.exception';

@Injectable()
export class DeleteIngredientService {
  constructor(private readonly ingredientRepository: IngredientRepository) {}

  async delete(id: string): Promise<void> {
    const result = await this.ingredientRepository.findById(id);
    if (!result) throw new IngredientNotFoundException(id);
    await this.ingredientRepository.delete(id);
  }
}
