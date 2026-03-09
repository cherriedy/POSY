import { PricingSnapshotTax as DomainPricingSnapshotTax } from './pricing-snapshot-tax.class';
import {
  Prisma,
  PricingSnapshotTax as PrismaPricingSnapshotTax,
} from '@prisma/client';
import {
  TaxType as DomainTaxType,
  TaxRateType as DomainTaxRateType,
} from '../enums';

export class PricingSnapshotTaxMapper {
  static toDomain(
    this: void,
    prisma: PrismaPricingSnapshotTax,
  ): DomainPricingSnapshotTax {
    return new DomainPricingSnapshotTax(
      prisma.id,
      prisma.snapshot_id,
      prisma.tax_id,
      prisma.tax_name,
      prisma.tax_type as DomainTaxType,
      prisma.rate_type as DomainTaxRateType,
      prisma.charge_rate !== null && prisma.charge_rate !== undefined
        ? Number(prisma.charge_rate)
        : 0,
      prisma.taxable_base !== null && prisma.taxable_base !== undefined
        ? Number(prisma.taxable_base)
        : 0,
      prisma.quantity ?? null,
      prisma.tax_amount !== null && prisma.tax_amount !== undefined
        ? Number(prisma.tax_amount)
        : 0,
    );
  }

  static toPrisma(domain: DomainPricingSnapshotTax): PrismaPricingSnapshotTax {
    return <PrismaPricingSnapshotTax>{
      ...(domain.id ? { id: domain.id } : {}),
      snapshot_id: domain.snapshotId,
      tax_id: domain.taxId,
      tax_name: domain.taxName,
      tax_type: domain.taxType,
      rate_type: domain.rateType,
      charge_rate:
        domain.chargeRate !== undefined && domain.chargeRate !== null
          ? new Prisma.Decimal(domain.chargeRate)
          : new Prisma.Decimal(0),
      taxable_base:
        domain.taxableBase !== undefined && domain.taxableBase !== null
          ? new Prisma.Decimal(domain.taxableBase)
          : new Prisma.Decimal(0),
      quantity:
        domain.quantity !== undefined && domain.quantity !== null
          ? domain.quantity
          : undefined,
      tax_amount:
        domain.taxAmount !== undefined && domain.taxAmount !== null
          ? new Prisma.Decimal(domain.taxAmount)
          : new Prisma.Decimal(0),
    };
  }
}
