import { Injectable } from '@nestjs/common';
import { ProductIngredientRepository, ProductRepository } from '../repositories';
import { ProductIngredient } from '../entities';
import { ProductNotFoundException } from '../exceptions';

@Injectable()
export class GetProductIngredientsService {
  constructor(
    private readonly productIngredientRepository: ProductIngredientRepository,
    private readonly productRepository: ProductRepository,
  ) {}

  async getByProductId(productId: string): Promise<ProductIngredient[]> {
    const product = await this.productRepository.findById(productId);
    if (!product) throw new ProductNotFoundException(productId);

    return await this.productIngredientRepository.findByProductId(productId);
  }
}
