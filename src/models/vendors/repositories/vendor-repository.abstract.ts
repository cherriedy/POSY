import { BaseRepository, Page } from '../../../common/interfaces';
import { Vendor } from '../entities';
import { VendorQueryParams } from '../interfaces';

export abstract class VendorRepository implements BaseRepository<Vendor> {
  abstract create(entity: Vendor): Promise<Vendor>;

  abstract findById(id: string): Promise<Vendor | null>;

  abstract findByIds(ids: string[]): Promise<Vendor[]>;

  abstract update(id: string, entity: Partial<Vendor>): Promise<Vendor>;

  abstract delete(id: string): Promise<void>;

  abstract getAllPaged(params: VendorQueryParams): Promise<Page<Vendor>>;
}
