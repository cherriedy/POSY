import { Injectable } from '@nestjs/common';
import { ProductAttributeRepository } from '../repositories';
import { ProductAttribute } from '../entities';

@Injectable()
export class GetAttributesService {
  constructor(
    private readonly productAttributeRepository: ProductAttributeRepository,
  ) {}

  /**
   * Retrieves product attributes for a specific product by its ID.
   *
   * @param productId - The unique identifier of the product
   * @returns The product attributes if found, null otherwise
   */
  async getByProductId(productId: string): Promise<ProductAttribute | null> {
    return await this.productAttributeRepository.findByProductId(productId);
  }
}
