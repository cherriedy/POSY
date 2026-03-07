import { Injectable } from '@nestjs/common';
import { ProductAttributeRepository, ProductRepository } from '../repositories';
import { ProductAttribute } from '../entities';
import { ProductAttributesUpsertPayload } from '../interfaces';
import { ProductNotFoundException } from '../exceptions';

@Injectable()
export class UpsertAttributesService {
  constructor(
    private readonly productAttributeRepository: ProductAttributeRepository,
    private readonly productRepository: ProductRepository,
  ) { }

  /**
   * Creates or updates product attributes for a specific product.
   * If attributes already exist for the product, they will be updated.
   * Otherwise, new attributes will be created.
   *
   * @param payload The payload containing the product attributes to upsert
   * @returns The created or updated product attributes
   */
  async upsert(
    payload: ProductAttributesUpsertPayload,
  ): Promise<ProductAttribute> {

    const updatePayload: Partial<ProductAttribute> = {
      ...payload,
      tasteProfile: payload.tasteProfile ?? undefined,
      dietaryTags: payload.dietaryTags ?? undefined,
    };

    if (payload.productId) {
      const product = await this.productRepository.findById(payload.productId);
      if (!product) throw new ProductNotFoundException(payload.productId);

      updatePayload.productId = payload.productId;
    }

    return await this.productAttributeRepository.upsert(updatePayload);
  }
}
