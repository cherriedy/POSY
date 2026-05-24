import { BaseRepository } from '@posy/shared';
import { Page } from '@posy/shared';
import { Cuisine } from '../entities/cuisine';
import { CuisineQueryParams } from '../interfaces/cuisine-query-params.interface';

/**
 * Abstract repository defining the contract for cuisine data access.
 */
export abstract class CuisineRepository implements BaseRepository<Cuisine> {
  abstract create(entity: Cuisine): Promise<Cuisine>;
  abstract findById(id: string): Promise<Cuisine | null>;
  abstract delete(id: string): Promise<void>;
  abstract update(id: string, entity: Partial<Cuisine>): Promise<Cuisine>;
  abstract getAllPaged(params: CuisineQueryParams): Promise<Page<Cuisine>>;
}
