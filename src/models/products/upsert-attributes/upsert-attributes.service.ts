import { Injectable } from '@nestjs/common';
import { ProductAttributeRepository } from 'src/models/products/repositories/product-attribute-repository.abstract';
import { ProductRepository } from 'src/models/products/repositories/product-repository.abstract';
import { ProductAttribute } from '../entities';
import { ProductAttributesUpsertPayload } from '../interfaces';
import { ProductNotFoundException } from '../exceptions';
import { EventEmitter2 } from '@nestjs/event-emitter';

@Injectable()
export class UpsertAttributesService {
  constructor(
    private readonly productAttributeRepository: ProductAttributeRepository,
    private readonly productRepository: ProductRepository,
    private readonly eventEmitter: EventEmitter2,
  ) {}

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

    // Non-blocking event emission to trigger recommendation recalculation
    this.eventEmitter.emit('product.updated', { id: payload.productId });

    return await this.productAttributeRepository.upsert(updatePayload);
  }
}
