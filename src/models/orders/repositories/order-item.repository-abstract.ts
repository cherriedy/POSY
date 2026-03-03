import { BaseRepository } from '../../../common/interfaces';
import { OrderItem } from '../types';

export abstract class OrderItemRepository implements BaseRepository<OrderItem> {
  abstract create(entity: OrderItem): Promise<OrderItem>;

  abstract bulkCreate(entities: OrderItem[]): Promise<OrderItem[]>;

  abstract findById(id: string): Promise<OrderItem | null>;

  abstract findByOrderId(orderId: string): Promise<OrderItem[]>;

  abstract delete(id: string): Promise<void>;

  abstract update(id: string, entity: Partial<OrderItem>): Promise<OrderItem>;
}
