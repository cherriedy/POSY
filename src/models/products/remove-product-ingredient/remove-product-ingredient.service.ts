import { Injectable } from '@nestjs/common';
import { ProductIngredientRepository } from '../repositories';

@Injectable()
export class RemoveProductIngredientService {
  constructor(
    private readonly productIngredientRepository: ProductIngredientRepository,
  ) {}

  async remove(productId: string, ingredientId: string): Promise<void> {
    await this.productIngredientRepository.deleteByProductIdAndIngredientId(
      productId,
      ingredientId,
    );
  }
}
