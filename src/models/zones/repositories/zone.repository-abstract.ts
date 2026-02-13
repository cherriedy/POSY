import { Zone } from '../types';
import { BaseRepository, Page } from '../../../common/interfaces';
import { ZoneQueryParams } from '../interfaces';

export abstract class ZoneRepository implements BaseRepository<Zone> {
  /**
   * Creates a new zone in the repository.
   * @param entity - The zone entity to create.
   * @returns A promise that resolves to the created zone.
   */
  abstract create(entity: Zone): Promise<Zone>;

  /**
   * Finds a zone by its unique identifier.
   * @param id - The unique identifier of the zone to find.
   * @returns A promise that resolves to the found zone or null if not found.
   */
  abstract findById(id: string): Promise<Zone | null>;

  /**
   * Deletes a zone by its unique identifier.
   * @param id - The unique identifier of the zone to delete.
   * @returns A promise that resolves when the zone is deleted.
   */
  abstract delete(id: string): Promise<void>;

  /**
   * Updates an existing zone by its unique identifier.
   * @param id - The unique identifier of the zone to update.
   * @param entity - Partial data to update the zone with.
   * @returns A promise that resolves to the updated zone.
   */
  abstract update(id: string, entity: Partial<Zone>): Promise<Zone>;

  /**
   * Retrieves a paginated list of zones based on query parameters.
   * @param params - The query parameters for pagination, filtering, and sorting.
   * @returns A promise that resolves to a paginated list of zones.
   */
  abstract getAllPaged(params: ZoneQueryParams): Promise<Page<Zone>>;
}
