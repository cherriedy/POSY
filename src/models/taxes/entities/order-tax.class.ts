import { Order } from '../../orders/types';
import { TaxConfig } from './tax-config.class';
import { OrderItem } from '../../orders/types';

export class OrderTax {
  constructor(
    public readonly id: string | null,
    public readonly taxId: string,
    public readonly orderId: string,
    public readonly orderItemId: string | null,
    public readonly taxName: string,
    public readonly taxRate: number,
    public readonly taxableBase: number,
    public readonly taxAmount: number,
    public readonly quantity: number | null,
    // Relations
    public readonly order: Order | null,
    public readonly tax: TaxConfig | null,
    public readonly orderItem: OrderItem | null,
  ) {}
}
