import { Injectable } from '@nestjs/common';
import { CategoryRepository } from '../../shared/repositories/category-repository.abstract';
import { Category } from '../../shared/entities/category';
import { CategoryNotFoundException } from '../../shared/exceptions/category-not-found.exception';
import { CategoryQueryParams } from '../../shared/interfaces/category-query-params.interface';
import { Page } from '@posy/shared';

@Injectable()
export class GetCategoriesService {
  constructor(private readonly categoryRepository: CategoryRepository) {}

  /**
   * Retrieves a paginated list of categories with advanced filtering and sorting.
   * @param {CategoryQueryParams} params - The query parameters for filtering, sorting, and pagination.
   * @returns {Promise<Page<Category>>} A promise that resolves to a paginated list of categories.
   */
  async getAll(params: CategoryQueryParams): Promise<Page<Category>> {
    return this.categoryRepository.getAllPaged(params);
  }

  /**
   * Retrieves a category by its unique identifier.
   * @param {string} id - The unique identifier of the category to retrieve.
   * @returns {Promise<Category>} A promise that resolves to the found category.
   * @throws {CategoryNotFoundException} If the category with the specified ID does not exist.
   */
  async getCategoryById(id: string): Promise<Category> {
    const category = await this.categoryRepository.findById(id);
    if (!category) {
      throw new CategoryNotFoundException(id);
    }
    return category;
  }
}
