import { BaseRepository } from '../../../../common/interfaces/base-repository.interface';
import { Page } from '../../../../common/interfaces/page.interface';
import { OrderQueryParams } from '../interfaces/order-query-params.interface';
import { Order } from '../entities/order';

export abstract class OrderRepository implements BaseRepository<Order> {
  abstract create(entity: Order): Promise<Order>;

  abstract findById(id: string): Promise<Order | null>;

  abstract findBySessionId(sessionId: string): Promise<Order | null>;

  abstract findActiveBySessionId(sessionId: string): Promise<Order | null>;

  abstract update(id: string, entity: Partial<Order>): Promise<Order>;

  abstract getAllPaged(params: OrderQueryParams): Promise<Page<Order>>;
}
