import { Injectable } from '@nestjs/common';
import {
  CategoryRepository,
  Category,
  CategoryNotFoundException,
  CategoryQueryParams,
} from '../../shared';
import { Page } from '../../../../common/interfaces';

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
