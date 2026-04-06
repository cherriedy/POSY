import { BaseRepository, Page } from '../../../../common/interfaces';
import { OrderQueryParams } from '../interfaces';
import { Order } from '../entities';

export abstract class OrderRepository implements BaseRepository<Order> {
  abstract create(entity: Order): Promise<Order>;

  abstract findById(id: string): Promise<Order | null>;

  abstract findBySessionId(sessionId: string): Promise<Order | null>;

  abstract update(id: string, entity: Partial<Order>): Promise<Order>;

  abstract getAllPaged(params: OrderQueryParams): Promise<Page<Order>>;
}
