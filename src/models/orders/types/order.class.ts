import { OrderStatus } from '../enums';

export class Order {
  constructor(
    public id: string | null,
    public createdBy: string,
    public tableId: string,
    public sessionId: string,
    public status: OrderStatus,
    public note: string | null,
    public subtotalAmount: number,
    public totalAmount: number,
    public createdAt: Date | null,
    public updatedAt: Date | null,
  ) {}
}
