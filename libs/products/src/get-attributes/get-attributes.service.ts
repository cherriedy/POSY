import { Injectable } from '@nestjs/common';
import { ProductAttributeRepository } from '../repositories/product-attribute-repository.abstract';
import { ProductRepository } from '../repositories/product-repository.abstract';
import { ProductAttribute } from '../entities/product-attribute';
import { ProductNotFoundException } from '../exceptions/product-not-found.exception';

@Injectable()
export class GetAttributesService {
  constructor(
    private readonly productAttributeRepository: ProductAttributeRepository,
    private readonly productRepository: ProductRepository,
  ) {}

  /**
   * Retrieves product attributes for a specific product by its ID.
   *
   * @param productId - The unique identifier of the product
   * @returns The product attributes if found, null otherwise
   */
  async getByProductId(id: string): Promise<ProductAttribute | null> {
    const product = await this.productRepository.findById(id);
    if (!product) throw new ProductNotFoundException(id);
    return await this.productAttributeRepository.findByProductId(id);
  }
}
