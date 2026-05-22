import { BaseRepository } from '../../../common/interfaces/base-repository.interface';
import { Page } from '../../../common/interfaces/page.interface';
import { PaginationParams } from '../../../common/interfaces/pagination-params.interface';
import { Product } from '../entities/product.class';
import { ProductIncludeOptions } from '../interfaces/product-query-params';

export abstract class ProductRepository implements BaseRepository<Product> {
  abstract create(entity: Product): Promise<Product>;

  abstract delete(id: string): Promise<void>;

  abstract findById(
    id: string,
    include?: ProductIncludeOptions,
  ): Promise<Product | null>;

  abstract findByIds(ids: string[]): Promise<Product[]>;

  abstract getAllPaged(
    params: PaginationParams,
    include?: ProductIncludeOptions,
  ): Promise<Page<Product>>;

  abstract update(id: string, entity: Partial<Product>): Promise<Product>;
}
