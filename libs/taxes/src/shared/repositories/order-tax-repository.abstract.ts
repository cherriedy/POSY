import { OrderTax } from '../entities/order-tax';

export abstract class OrderTaxRepository {
  abstract create(entity: OrderTax): Promise<OrderTax>;

  abstract bulkCreate(entities: OrderTax[]): Promise<OrderTax[]>;

  abstract findByOrderId(orderId: string): Promise<OrderTax[]>;

  abstract findByOrderItemId(orderItemId: string): Promise<OrderTax[]>;

  abstract delete(id: string): Promise<void>;
}
