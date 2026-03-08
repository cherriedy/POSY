import { Injectable } from '@nestjs/common';
import { IngredientRepository } from '../repositories';
import { IngredientNotFoundException } from '../exceptions';

@Injectable()
export class DeleteIngredientService {
  constructor(private readonly ingredientRepository: IngredientRepository) {}

  async delete(id: string): Promise<void> {
    const result = await this.ingredientRepository.findById(id);
    if (!result) throw new IngredientNotFoundException(id);
    await this.ingredientRepository.delete(id);
  }
}
