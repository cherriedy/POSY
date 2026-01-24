import { Category } from '../types';
import { BaseRepository, Page } from '../../../common/interfaces';
import { CategoryQueryParams } from '../interfaces';

export abstract class CategoryRepository implements BaseRepository<Category> {
  /**
   * Creates a new category in the repository.
   * @param entity - The category entity to create.
   * @returns A promise that resolves to the created category.
   */
  abstract create(entity: Category): Promise<Category>;

  /**
   * Finds a category by its unique identifier.
   * @param id - The unique identifier of the category to find.
   * @returns A promise that resolves to the found category or null if not found.
   */
  abstract findById(id: string): Promise<Category | null>;

  /**
   * Deletes a category by its unique identifier.
   * @param id - The unique identifier of the category to delete.
   * @returns A promise that resolves when the category is deleted.
   */
  abstract delete(id: string): Promise<void>;

  /**
   * Updates an existing category by its unique identifier.
   * @param id - The unique identifier of the category to update.
   * @param entity - Partial data to update the category with.
   * @returns A promise that resolves to the updated category.
   */
  abstract update(id: string, entity: Partial<Category>): Promise<Category>;

  /**
   * Retrieves a paginated list of categories based on query parameters.
   * @param params - The query parameters for pagination, filtering, and sorting.
   * @returns A promise that resolves to a paginated list of categories.
   */
  abstract getAllPaged(params: CategoryQueryParams): Promise<Page<Category>>;
}
