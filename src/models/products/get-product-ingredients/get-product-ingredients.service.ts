import { Injectable } from '@nestjs/common';
import { ProductIngredientRepository } from 'src/models/products/repositories/product-ingredient-repository.abstract';
import { ProductIngredient } from '../entities';
import { ProductNotFoundException } from '../exceptions';
import { ProductRepository } from '../repositories/product-repository.abstract';

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
