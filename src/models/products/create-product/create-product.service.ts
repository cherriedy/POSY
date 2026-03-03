import { Injectable } from '@nestjs/common';
import { ProductRepository, ProductAttributeRepository } from '../repositories';
import { Product, ProductAttribute } from '../types';
import { getSlug } from '../../../common/utilities/string.util';
import { ProductCreatePayload } from '../interfaces';
import {
  MealSession,
  Taste,
  DietaryTag,
  Season,
  ProductDiscountType,
} from '../enums';

@Injectable()
export class CreateProductService {
  constructor(
    private readonly productRepository: ProductRepository,
    private readonly productAttributeRepository: ProductAttributeRepository,
  ) {}

  /**
   * Creates a new product in the repository.
   * If slug is not provided, it will be auto-generated from the product name.
   * Optionally creates product attributes if provided in the payload.
   *
   * @param {ProductCreatePayload} payload - The product data payload to be created.
   * @returns {Promise<Product>} The created product entity as stored in the repository.
   *
   * @throws {Error} If the product creation fails due to validation, database, or repository errors.
   */
  async create(payload: ProductCreatePayload): Promise<Product> {
    // Create product domain entity from payload
    const product = new Product(
      null, // id
      payload.categoryId,
      payload.sku ?? null,
      payload.name,
      payload.slug ?? getSlug(payload.name),
      payload.description ?? null,
      payload.price,
      (payload.discountType as ProductDiscountType) ?? null,
      payload.discountValue ?? null,
      payload.imageUrl ?? null,
      payload.stockQuantity ?? 0,
      payload.isAvailable ?? true,
      false, // isDeleted
      null, // deletedAt
      null, // createdAt
      null, // updatedAt
      undefined, // category
    );

    const createdProduct = await this.productRepository.create(product);

    // Create attributes if provided
    if (payload.attributes) {
      const attributesEntity = new ProductAttribute(
        null,
        payload.attributes.cuisineId ?? null,
        createdProduct.id!,
        (payload.attributes.mealSession as MealSession) ?? null,
        (payload.attributes.tasteProfile as Taste[]) ?? [],
        (payload.attributes.dietaryTags as DietaryTag[]) ?? [],
        payload.attributes.preparationTime ?? null,
        payload.attributes.spiceLevel ?? null,
        payload.attributes.isSeasonal ?? false,
        (payload.attributes.season as Season) ?? null,
        null,
        null,
        null,
      );

      await this.productAttributeRepository.create(attributesEntity);
    }

    return createdProduct;
  }
}
