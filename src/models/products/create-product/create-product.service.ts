import { Injectable } from '@nestjs/common';
import { ProductRepository } from 'src/models/products/repositories/product-repository.abstract';
import { ProductAttributeRepository } from 'src/models/products/repositories/product-attribute-repository.abstract';
import { ProductIngredientRepository } from 'src/models/products/repositories/product-ingredient-repository.abstract';
import { Product, ProductAttribute, ProductIngredient } from '../entities';
import { getSlug } from '../../../common/utilities/string.util';
import { ProductCreatePayload } from '../interfaces';
import {
  MealSession,
  Taste,
  DietaryTag,
  Season,
  ProductDiscountType,
} from '../enums';
import { EventEmitter2 } from '@nestjs/event-emitter';

@Injectable()
export class CreateProductService {
  constructor(
    private readonly productRepository: ProductRepository,
    private readonly productAttributeRepository: ProductAttributeRepository,
    private readonly productIngredientRepository: ProductIngredientRepository,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  /**
   * Creates a new product in the repository.
   * If slug is not provided, it will be auto-generated from the product name.
   * Optionally creates product attributes if provided in the payload.
   * Optionally creates product ingredients if provided in the payload.
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
      const attributes = new ProductAttribute(
        undefined,
        createdProduct.id!,
        payload.attributes.cuisineId ?? null,
        (payload.attributes.mealSession as MealSession) ?? null,
        (payload.attributes.tasteProfile as Taste[]) ?? [],
        (payload.attributes.dietaryTags as DietaryTag[]) ?? [],
        payload.attributes.preparationTime ?? null,
        payload.attributes.spiceLevel ?? null,
        payload.attributes.isSeasonal ?? false,
        (payload.attributes.season as Season) ?? null,
      );
      await this.productAttributeRepository.upsert(attributes);
    }

    // Create ingredients if provided
    if (payload.ingredients && payload.ingredients.length > 0) {
      const ingredientEntities = payload.ingredients.map(
        (ingredient) =>
          new ProductIngredient(
            null,
            createdProduct.id!,
            ingredient.ingredientId,
            ingredient.quantity,
            null,
            null,
          ),
      );
      await this.productIngredientRepository.bulkUpsert(
        createdProduct.id!,
        ingredientEntities,
      );
    }

    // Non-blocking event emission for product creation
    this.eventEmitter.emit('product.created', { id: createdProduct.id! });

    return createdProduct;
  }
}
