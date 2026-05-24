import { OrderStatus } from '../enums/order-status.enum';
import { User } from '@posy/users/shared/entities/user';
import { Table } from '../../../tables/types/table';
import { TableSession } from '../../../table-sessions/shared/entities/table-session';
import { OrderItem } from './order-item';
import { Payment } from '@posy/payments/shared/entities/payment';
import { PricingSnapshot } from '../../../promotions/types/pricing-snapshot';

export class Order {
  constructor(
    public id: string | null,
    public createdBy: string | null,
    public tableId: string,
    public sessionId: string,
    public status: OrderStatus,
    public note: string | null,
    public subtotalAmount: number,
    public totalAmount: number,
    public createdAt: Date | null,
    public updatedAt: Date | null,
    // Relations
    public user: User | null,
    public table: Table | null,
    public session: TableSession | null,
    public orderItems: OrderItem[] | null,
    public payments: Payment[] | null,
    public pricingSnapshots: PricingSnapshot[] | null = null,
  ) {}
}
