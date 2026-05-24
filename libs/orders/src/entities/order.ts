import { OrderStatus } from '../enums/order-status.enum';
import { User } from '@posy/users/shared/entities/user';
import { Table } from '@posy/tables/shared/entities/table';
import { OrderItem } from './order-item';

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
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    public session: any | null,
    public orderItems: OrderItem[] | null,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    public payments: any[] | null,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    public pricingSnapshots: any[] | null = null,
  ) {}
}
