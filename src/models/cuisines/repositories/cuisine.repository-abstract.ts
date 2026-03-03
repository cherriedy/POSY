import { BaseRepository, Page } from '../../../common/interfaces';
import { Cuisine } from '../types';
import { CuisineQueryParams } from '../interfaces';

/**
 * Abstract repository defining the contract for cuisine data access.
 */
export abstract class CuisineRepository implements BaseRepository<Cuisine> {
  /**
   * Creates a new cuisine.
   */
  abstract create(entity: Cuisine): Promise<Cuisine>;

  /**
   * Finds a cuisine by its unique identifier.
   */
  abstract findById(id: string): Promise<Cuisine | null>;

  /**
   * Deletes a cuisine by its identifier.
   */
  abstract delete(id: string): Promise<void>;

  /**
   * Updates an existing cuisine.
   */
  abstract update(id: string, entity: Partial<Cuisine>): Promise<Cuisine>;

  /**
   * Retrieves a paginated list of cuisines matching the query parameters.
   */
  abstract getAllPaged(params: CuisineQueryParams): Promise<Page<Cuisine>>;
}
