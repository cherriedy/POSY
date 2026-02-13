import { PaymentStatus } from '../enums';
import { Order } from '../../orders/types/order.class';
import { PaymentMethod } from './payment-method.class';
import { User } from '../../users/types/user.class';

export class Payment {
  constructor(
    public id: string | null,
    public methodId: string,
    public orderId: string,
    public createdBy: string,
    public amount: number,
    public feeAmount: number | null,
    public referenceNumber: string | null,
    public status: PaymentStatus = PaymentStatus.PENDING,
    public paymentUrl: string | null,
    public paidAt: Date | null,
    public expiredAt: Date | null,
    public metadata: Record<string, any> | null,
    public createdAt: Date | null,
    public updatedAt: Date | null,
    // Relations
    public order: Order | null,
    public method: PaymentMethod | null,
    public user: User | null,
  ) {}
}
