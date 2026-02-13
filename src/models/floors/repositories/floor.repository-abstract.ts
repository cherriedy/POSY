import { Floor } from '../types';
import { BaseRepository, Page } from '../../../common/interfaces';
import { FloorQueryParams } from '../interfaces';

export abstract class FloorRepository implements BaseRepository<Floor> {
  /**
   * Creates a new floor in the repository.
   * @param entity - The floor entity to create.
   * @returns A promise that resolves to the created floor.
   */
  abstract create(entity: Floor): Promise<Floor>;

  /**
   * Finds a floor by its unique identifier.
   * @param id - The unique identifier of the floor to find.
   * @returns A promise that resolves to the found floor or null if not found.
   */
  abstract findById(id: string): Promise<Floor | null>;

  /**
   * Deletes a floor by its unique identifier.
   * @param id - The unique identifier of the floor to delete.
   * @returns A promise that resolves when the floor is deleted.
   */
  abstract delete(id: string): Promise<void>;

  /**
   * Updates an existing floor by its unique identifier.
   * @param id - The unique identifier of the floor to update.
   * @param entity - Partial data to update the floor with.
   * @returns A promise that resolves to the updated floor.
   */
  abstract update(id: string, entity: Partial<Floor>): Promise<Floor>;

  /**
   * Retrieves a paginated list of floors based on query parameters.
   * @param params - The query parameters for pagination, filtering, and sorting.
   * @returns A promise that resolves to a paginated list of floors.
   */
  abstract getAllPaged(params: FloorQueryParams): Promise<Page<Floor>>;
}
