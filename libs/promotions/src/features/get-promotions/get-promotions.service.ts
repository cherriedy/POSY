import { Injectable } from '@nestjs/common';
import { PromotionCategoryRepository } from '../../shared/repositories/promotion-category-repository.abstract';
import { PromotionProductRepository } from '../../shared/repositories/promotion-product-repository.abstract';
import { PromotionRepository } from '../../shared/repositories/promotion-repository.abstract';
import { PromotionQueryParams } from '../../shared/interfaces/promotion-query-params.interface';
import { PromotionNotFoundError } from '../../shared/errors/promotion-not-found.error';
import { Role } from '@posy/shared';
import { Promotion } from '../../shared/entities/promotion';
import { PromotionCategory } from '../../shared/entities/promotion-category';
import { PromotionProduct } from '../../shared/entities/promotion-product';
import { ProductRepository } from '@posy/products/repositories/product-repository.abstract';
import { ProductNotFoundException } from '@posy/products/exceptions/product-not-found.exception';
import { Page } from '@posy/shared';
import { CategoryRepository } from '@posy/categories/shared/repositories/category-repository.abstract';
import { CategoryNotFoundException } from '@posy/categories/shared/errors/category-not-found.exception';

@Injectable()
export class GetPromotionsService {
  constructor(
    private readonly promotionRepository: PromotionRepository,
    private readonly promotionCategoryRepository: PromotionCategoryRepository,
    private readonly promotionProductRepository: PromotionProductRepository,
    private readonly productRepository: ProductRepository,
    private readonly categoryRepository: CategoryRepository,
  ) {}

  /**
   * Retrieves a paginated list of promotions based on the provided query parameters.
   * @param {PromotionQueryParams} params - The query parameters for filtering and pagination.
   * @returns {Promise<Page<Promotion>>} A promise that resolves to a paginated list of promotions.
   */
  async getAll(params: PromotionQueryParams): Promise<Page<Promotion>> {
    return this.promotionRepository.getAllPaged(params);
  }

  /**
   * Retrieves a promotion by its unique identifier.
   * Throws PromotionNotFoundError if the promotion does not exist.
   * @param {string} id - The unique identifier of the promotion.
   * @returns {Promise<Promotion>} A promise that resolves to the promotion object.
   * @throws {PromotionNotFoundError} If the promotion is not found.
   */
  async getById(id: string): Promise<Promotion | null> {
    const promotion = await this.promotionRepository.findById(id);
    if (!promotion) throw new PromotionNotFoundError({ id });
    const usageCount = await this.promotionRepository.getUsageCount(id);
    promotion.usageCount = usageCount;

    return promotion;
  }

  /**
   * Retrieves a promotion by its unique code.
   * Throws PromotionNotFoundError if the promotion does not exist.
   * @param {string} code - The unique code of the promotion.
   * @returns {Promise<Promotion>} A promise that resolves to the promotion object.
   * @throws {PromotionNotFoundError} If the promotion is not found.
   */
  async getByCode(code: string): Promise<Promotion | null> {
    const promotion = await this.promotionRepository.findByCode(code);
    if (!promotion) throw new PromotionNotFoundError({ code });
    return promotion;
  }

  /**
   * Retrieves all promotion categories.
   * @returns {Promise<any[]>} A promise that resolves to an array of promotion categories.
   */
  async getPromotionCategories(): Promise<any[]> {
    return await this.promotionCategoryRepository.getAll();
  }

  /**
   * Retrieves all promotion categories associated with a given promotion ID.
   * Throws PromotionNotFoundError if the promotion does not exist or is deleted.
   * @param {string} promotionId - The unique identifier of the promotion.
   * @returns {Promise<PromotionCategory[]>} A promise that resolves to an array of promotion categories.
   * @throws {PromotionNotFoundError} If the promotion is not found or is deleted.
   */
  async getPromotionCategoriesByPromotionId(
    promotionId: string,
  ): Promise<PromotionCategory[]> {
    const promotion = await this.promotionRepository.findById(promotionId);

    if (!promotion || promotion.isDeleted) {
      throw new PromotionNotFoundError({ id: promotionId });
    }

    return this.promotionCategoryRepository.findByPromotionId(promotionId);
  }

  /**
   * Retrieves all promotion products.
   * @returns {Promise<any[]>} A promise that resolves to an array of promotion products.
   */
  async getPromotionProducts(): Promise<any[]> {
    return await this.promotionProductRepository.getAll();
  }

  /**
   * Retrieves all promotion products associated with a given promotion ID.
   * Throws PromotionNotFoundError if the promotion does not exist or is deleted.
   * @param {string} promotionId - The unique identifier of the promotion.
   * @returns {Promise<PromotionProduct[]>} A promise that resolves to an array of promotion products.
   * @throws {PromotionNotFoundError} If the promotion is not found or is deleted.
   */
  async getPromotionProductsByPromotionId(
    promotionId: string,
  ): Promise<PromotionProduct[]> {
    const promotion = await this.promotionRepository.findById(promotionId);

    if (!promotion || promotion.isDeleted) {
      throw new PromotionNotFoundError({ id: promotionId });
    }

    return this.promotionProductRepository.findByPromotionId(promotionId);
  }

  /**
   * Retrieves a promotion product by its unique identifier.
   * Throws PromotionProductNotFoundError if the product does not exist.
   * @param {string} id - The unique identifier of the promotion product.
   * @returns {Promise<PromotionProduct>} A promise that resolves to the promotion product object.
   * @throws {PromotionProductNotFoundError} If the product is not found.
   */
  // async getPromotionProductById(id: string): Promise<PromotionProduct | null> {
  //   const result = await this.promotionProductRepository.findById(id);
  //   if (!result) throw new PromotionProductNotFoundError(id);
  //   return result;
  // }

  /**
   * Retrieves all applicable promotions for a given product.
   *
   * This method returns all active, non-deleted promotions that can be applied to the specified product.
   * It combines:
   *   1. Promotions directly associated with the product (product-level promotions).
   *   2. Promotions associated with the product's category (category-level promotions), if the product has a category.
   *
   * The method does NOT deduplicate promotions by ID, as product and category promotions are managed separately.
   * Throws ProductNotFoundException if the product does not exist.
   *
   * @param {string} productId - The unique identifier of the product.
   * @returns {Promise<Promotion[]>} A promise that resolves to an array of applicable promotions for the product.
   * @throws {ProductNotFoundException} If the product is not found.
   */
  async getApplicablePromotionsForProduct(
    productId: string,
  ): Promise<Promotion[]> {
    const product = await this.productRepository.findById(productId);
    if (!product) throw new ProductNotFoundException(productId);

    const PAP = await this.promotionProductRepository.getPromotionsByProductId(
      productId,
      false,
    );

    if (product.categoryId) {
      const CAP =
        await this.promotionCategoryRepository.getPromotionsByCategoryId(
          product.categoryId,
          false,
        );
      return [...PAP, ...CAP];
    }
    return PAP;
  }
}
