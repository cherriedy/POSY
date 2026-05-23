import { BaseRepository } from '../../../common/interfaces/base-repository.interface';
import { Page } from '../../../common/interfaces/page.interface';
import { Vendor } from '../entities/vendor';
import { VendorQueryParams } from '../interfaces/vendor-query-params.interface';

export abstract class VendorRepository implements BaseRepository<Vendor> {
  abstract create(entity: Vendor): Promise<Vendor>;

  abstract findById(id: string): Promise<Vendor | null>;

  abstract findByIds(ids: string[]): Promise<Vendor[]>;

  abstract update(id: string, entity: Partial<Vendor>): Promise<Vendor>;

  abstract delete(id: string): Promise<void>;

  abstract getAllPaged(params: VendorQueryParams): Promise<Page<Vendor>>;
}
