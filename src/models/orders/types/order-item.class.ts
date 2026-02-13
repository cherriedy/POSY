import { OrderItemStatus } from '../enums';
import { Order } from './order.class';
import { Product } from '../../products/types';
import { OrderTax } from '../../taxes/types';

export class OrderItem {
  constructor(
    public id: string | null,
    public orderId: string,
    public productId: string,
    public quantity: number = 1,
    public unitPrice: number,
    public subtotal: number,
    public note: string | null,
    public status: OrderItemStatus = OrderItemStatus.WAITING,
    public startedAt: Date | null,
    public completedAt: Date | null,
    public servedAt: Date | null,
    public createdAt: Date | null,
    public updatedAt: Date | null,
    // Relations
    public order: Order | null,
    public product: Product | null,
    public orderTaxes: OrderTax[] | null,
  ) {}
}
