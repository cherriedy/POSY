import { Injectable } from '@nestjs/common';
import { IngredientRepository } from '../repositories';

@Injectable()
export class DeleteIngredientService {
  constructor(private readonly ingredientRepository: IngredientRepository) {}

  async delete(id: string): Promise<void> {
    await this.ingredientRepository.delete(id);
  }
}
