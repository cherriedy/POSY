import { TaxRateType, TaxType } from '../enums';
import { OrderTax } from './order-tax.class';
import { PricingSnapshotTax } from './pricing-snapshot-tax.class';

export class TaxConfig {
  constructor(
    public id: string | null,
    public type: TaxType,
    public name: string,
    public displayName: string,
    public description: string | null,
    public rateType: TaxRateType,
    public chargeRate: number,
    public isActive: boolean = true,
    public isIncluded: boolean = false,
    public applyAfterVAT: boolean = false,
    public sortOrder: number = 0,
    public isDeleted: boolean = false,
    public deletedAt: Date | null = null,
    public createdAt: Date | null,
    public updatedAt: Date | null,
    // Relations
    public orderTaxes: OrderTax[] | null,
    public pricingSnapshotTaxes: PricingSnapshotTax[] | null,
  ) {}
}
