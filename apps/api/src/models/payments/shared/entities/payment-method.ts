import { PaymentFeeType } from '../enums/payment-fee-type.enum';
import { PaymentProvider } from '../enums/payment-provider.enum';
import { Payment } from './payment';

export class PaymentMethod {
  constructor(
    public id: string | null,
    public provider: PaymentProvider,
    public name: string,
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
