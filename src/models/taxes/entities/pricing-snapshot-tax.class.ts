import { TaxRateType, TaxType } from '../enums';

export class PricingSnapshotTax {
  constructor(
    public id: string | null,
    public snapshotId: string,
    public taxId: string,
    public taxName: string,
    public taxType: TaxType,
    public rateType: TaxRateType,
    public chargeRate: number,
    public taxableBase: number,
    public quantity: number | null,
    public taxAmount: number,
  ) {}
}
