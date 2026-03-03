import { Injectable } from '@nestjs/common';
import { ProductAttributeRepository } from '../repositories';
import { ProductAttribute } from '../entities';
import { ProductAttributeUpsertRequestDto } from '../dto';

@Injectable()
export class UpsertAttributesService {
  constructor(
    private readonly productAttributeRepository: ProductAttributeRepository,
  ) {}

  /**
   * Creates or updates product attributes for a specific product.
   * If attributes already exist for the product, they will be updated.
   * Otherwise, new attributes will be created.
   *
   * @param productId - The unique identifier of the product
   * @param dto - The product attribute data to create or update
   * @returns The created or updated product attributes
   */
  async upsert(
    productId: string,
    dto: ProductAttributeUpsertRequestDto,
  ): Promise<ProductAttribute> {
    // Check if attributes already exist
    const existing =
      await this.productAttributeRepository.findByProductId(productId);

    if (existing) {
      // Update existing attributes
      return await this.productAttributeRepository.update(productId, {
        cuisineId: dto.cuisineId,
        mealSession: dto.mealSession,
        tasteProfile: dto.tasteProfile ?? [],
        dietaryTags: dto.dietaryTags ?? [],
        preparationTime: dto.preparationTime,
        spiceLevel: dto.spiceLevel,
        isSeasonal: dto.isSeasonal ?? false,
        season: dto.season,
      });
    } else {
      // Create new attributes
      const newAttributes = new ProductAttribute(
        null,
        dto.cuisineId ?? null,
        productId,
        dto.mealSession ?? null,
        dto.tasteProfile ?? [],
        dto.dietaryTags ?? [],
        dto.preparationTime ?? null,
        dto.spiceLevel ?? null,
        dto.isSeasonal ?? false,
        dto.season ?? null,
        null,
        null,
      );
      return await this.productAttributeRepository.create(newAttributes);
    }
  }
}
