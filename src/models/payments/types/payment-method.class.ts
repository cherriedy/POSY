import { PaymentFeeType, PaymentProvider } from '../enums';
import { Payment } from './payment.class';

export class PaymentMethod {
  constructor(
    public id: string | null,
    public provider: PaymentProvider,
    public name: string,
    public displayName: string,
    public iconUrl: string | null,
    public isActive: boolean = true,
    public feeType: PaymentFeeType | null,
    public feeValue: number | null,
    public sortOrder: number = 0,
    public createdAt: Date | null,
    public updatedAt: Date | null,
    // Relations
    public payments: Payment[] | null,
  ) {}
}
