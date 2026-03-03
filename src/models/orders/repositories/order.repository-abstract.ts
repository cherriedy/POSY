import { BaseRepository, Page } from '../../../common/interfaces';
import { Order } from '../types';
import { OrderQueryParams } from '../interfaces';

export abstract class OrderRepository implements BaseRepository<Order> {
  abstract create(entity: Order): Promise<Order>;

  abstract findById(id: string): Promise<Order | null>;

  abstract delete(id: string): Promise<void>;

  abstract update(id: string, entity: Partial<Order>): Promise<Order>;

  abstract getAllPaged(params: OrderQueryParams): Promise<Page<Order>>;
}
