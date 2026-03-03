import { OrderStatus } from '../enums';
import { User } from '../../users/types/user.class';
import { Table } from '../../tables/types';
import { TableSession } from '../../table-sessions/types';
import { OrderItem } from './order-item.class';
import { Payment } from '../../payments/types';

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
  ) {}
}
