import { Order } from '../../orders/shared/entities/order';
import { OrderItem } from '../../orders/shared/entities/order-item';
import { TaxRateType } from '../enums/tax-rate-type.enum';
import { TaxType } from '../enums/tax-type.enum';

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
