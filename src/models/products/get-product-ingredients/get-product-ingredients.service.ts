import { Injectable } from '@nestjs/common';
import { ProductIngredientRepository } from '../repositories';
import { ProductIngredient } from '../entities';

@Injectable()
export class GetProductIngredientsService {
  constructor(
    private readonly productIngredientRepository: ProductIngredientRepository,
  ) {}

  async getByProductId(productId: string): Promise<ProductIngredient[]> {
    return await this.productIngredientRepository.findByProductId(productId);
  }
}
