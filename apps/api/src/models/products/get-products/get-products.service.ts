import { Injectable } from '@nestjs/common';
import { ProductRepository } from 'src/models/products/repositories/product-repository.abstract';
import { ProductIncludeOptions, ProductQueryParams } from '../interfaces/product-query-params.interface';
import { Page } from '@posy/shared';
import { Product } from '../entities/product';
import { ProductNotFoundException } from '../exceptions/product-not-found.exception';

@Injectable()
export class GetProductsService {
  constructor(private readonly productRepository: ProductRepository) {}

  /**
   * Retrieves a paginated list of products based on the provided query parameters.
   *
   * @param {ProductQueryParams} params - The query parameters for filtering, sorting, and paginating products.
   * @param {ProductIncludeOptions} [include] - Optional relations to eagerly load (attributes, ingredients).
   * @returns {Promise<Page<Product>>} A promise that resolves to a paginated list of products.
   */
  async getAll(
    params: ProductQueryParams,
    include?: ProductIncludeOptions,
  ): Promise<Page<Product>> {
    return await this.productRepository.getAllPaged(params, include);
  }

  /**
   * Retrieves a product by its unique identifier.
   *
   * @param {string} id - The unique identifier of the product to retrieve.
   * @param {ProductIncludeOptions} [include] - Optional relations to eagerly load (attributes, ingredients).
   * @returns {Promise<Product>} A promise that resolves to the product object.
   *
   * @throws {ProductNotFoundException} If the product with the specified ID does not exist.
   */
  async getById(id: string, include?: ProductIncludeOptions): Promise<Product> {
    const product = await this.productRepository.findById(id, include);
    if (!product) throw new ProductNotFoundException(id);
    return product;
  }
}
