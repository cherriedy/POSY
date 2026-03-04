import { BaseRepository, Page } from '../../../common/interfaces';
import { Unit } from '../entities';
import { UnitQueryParams } from '../interfaces';

export abstract class UnitRepository implements BaseRepository<Unit> {
  abstract create(entity: Unit): Promise<Unit>;

  abstract findById(id: string): Promise<Unit | null>;

  abstract update(id: string, entity: Partial<Unit>): Promise<Unit>;

  abstract delete(id: string): Promise<void>;

  abstract getAllPaged(params: UnitQueryParams): Promise<Page<Unit>>;
}
