import { Injectable } from '@nestjs/common';
import { ProductRepository } from '../repositories';
import { Product } from '../types';
import { getSlug } from '../../../common/utilities/string.util';

@Injectable()
export class CreateProductService {
  constructor(private readonly productRepository: ProductRepository) {}

  /**
   * Creates a new product in the repository.
   * If slug is not provided, it will be auto-generated from the product name.
   *
   * @param {Product} product - The product entity to be created. This should contain all required product fields.
   * @returns {Promise<Product>} The created product entity as stored in the repository.
   *
   * @throws {Error} If the product creation fails due to validation, database, or repository errors.
   */
  async create(product: Product): Promise<Product> {
    // Auto-generate slug from name if not provided
    if (!product.slug) {
      product.slug = getSlug(product.name);
    }

    return await this.productRepository.create(product);
  }
}
