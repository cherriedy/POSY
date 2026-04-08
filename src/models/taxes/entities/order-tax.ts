import { Order, OrderItem } from '../../orders/shared/entities';
import { TaxRateType, TaxType } from '../enums';

export class OrderTax {
  constructor(
    public readonly id: string | null,
    public readonly taxConfigId: string,
    public readonly orderId: string,
    public readonly orderItemId: string | null,
    public readonly taxName: string,
    public readonly taxType: TaxType,
    public readonly rateType: TaxRateType,
    public readonly chargeRate: number,
    public readonly taxableBase: number,
    public readonly taxAmount: number,
    public readonly quantity: number | null,
    // Relations
    public readonly order: Order | null,
    public readonly orderItem: OrderItem | null,
  ) {}
}
