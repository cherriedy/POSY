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
    const updatePayload: Partial<ProductAttribute> = {};
    if (payload.productId) {
      const product = await this.productRepository.findById(payload.productId);
      if (!product) throw new ProductNotFoundException(payload.productId);
    }

    if (payload.cuisineId) {
      updatePayload.cuisineId = payload.cuisineId;
    }
    if (payload.mealSession) {
      updatePayload.mealSession = payload.mealSession;
    }
    if (payload.preparationTime) {
      updatePayload.preparationTime = payload.preparationTime;
    }
    if (payload.spiceLevel) {
      updatePayload.spiceLevel = payload.spiceLevel;
    }
    if (payload.isSeasonal) {
      updatePayload.isSeasonal = payload.isSeasonal;
    }
    if (payload.season) {
      updatePayload.season = payload.season;
    }
    if (payload.tasteProfile) {
      updatePayload.tasteProfile = payload.tasteProfile;
    }
    if (payload.dietaryTags) {
      updatePayload.dietaryTags = payload.dietaryTags;
    }

    return await this.productAttributeRepository.upsert(updatePayload);
  }
}
