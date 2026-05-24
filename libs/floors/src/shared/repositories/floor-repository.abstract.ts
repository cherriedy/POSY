import { Floor } from '../entities/floor';
import { BaseRepository } from '@posy/shared';
import { Page } from '@posy/shared';
import { FloorQueryParams } from '../interfaces/floor-query-params.interface';

export abstract class FloorRepository implements BaseRepository<Floor> {
  abstract create(entity: Floor): Promise<Floor>;
  abstract findById(id: string): Promise<Floor | null>;
  abstract findByIds(ids: string[]): Promise<Floor[]>;
  abstract delete(id: string): Promise<void>;
  abstract update(id: string, entity: Partial<Floor>): Promise<Floor>;
  abstract getAllPaged(params: FloorQueryParams): Promise<Page<Floor>>;
}
