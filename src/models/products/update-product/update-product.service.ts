import { Injectable } from '@nestjs/common';
import { ProductRepository } from '../repositories';
import { Product } from '../types';
import { getSlug } from '../../../common/utilities/string.util';

@Injectable()
export class UpdateProductService {
  constructor(private readonly productRepository: ProductRepository) {}

  /**
   * Updates an existing product in the repository.
   * If name is being updated but slug is not provided, slug will be auto-generated from the new name.
   *
   * @param {string} id - The unique identifier of the product to update.
   * @param {Partial<Product>} product - An object containing the fields to update for the product. Only provided fields will be updated.
   * @returns {Promise<Product>} The updated product entity as stored in the repository.
   *
   * @throws {Error} If the update fails due to validation, the product not being found, or repository/database errors.
   */
  async update(id: string, product: Partial<Product>): Promise<Product> {
    // Auto-generate slug from name if name is being updated but slug is not provided
    if (product.name && !product.slug) {
      product.slug = getSlug(product.name);
    }

    return await this.productRepository.update(id, product);
  }
}
