import { OrderItemStatus } from '../enums/order-item-status.enum';
import { Order } from './order';
import { Product } from '@posy/products/entities/product';
import { OrderTax } from '../../../taxes/entities/order-tax';

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
