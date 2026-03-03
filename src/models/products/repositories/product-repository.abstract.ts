import {
  BaseRepository,
  Page,
  PaginationParams,
} from '../../../common/interfaces';
import { Product } from '../entities';

export abstract class ProductRepository implements BaseRepository<Product> {
  abstract create(entity: Product): Promise<Product>;

  abstract delete(id: string): Promise<void>;

  abstract findById(id: string): Promise<Product | null>;

  abstract findByIds(ids: string[]): Promise<Product[]>;

  abstract getAllPaged(params: PaginationParams): Promise<Page<Product>>;

  abstract update(id: string, entity: Partial<Product>): Promise<Product>;
}
