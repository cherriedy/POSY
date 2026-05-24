import { BaseRepository } from '../../../common/interfaces/base-repository.interface';
import { Page } from '../../../common/interfaces/page.interface';
import { Unit } from '../entities/unit';
import { UnitQueryParams } from '../interfaces/unit-query-params.interface';

export abstract class UnitRepository implements BaseRepository<Unit> {
  abstract create(entity: Unit): Promise<Unit>;

  abstract findById(id: string): Promise<Unit | null>;

  abstract update(id: string, entity: Partial<Unit>): Promise<Unit>;

  abstract delete(id: string): Promise<void>;

  abstract getAllPaged(params: UnitQueryParams): Promise<Page<Unit>>;
}
