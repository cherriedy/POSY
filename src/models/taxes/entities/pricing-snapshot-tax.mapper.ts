import {
  Prisma,
  PricingSnapshotTax as PrismaPricingSnapshotTax,
} from '@prisma/client';
import {
  TaxType as DomainTaxType,
  TaxRateType as DomainTaxRateType,
} from '../enums';
import { PricingSnapshotTax } from './pricing-snapshot-tax';

export class PricingSnapshotTaxMapper {
  static toDomain(
    this: void,
    prisma: PrismaPricingSnapshotTax,
  ): PricingSnapshotTax {
    return new PricingSnapshotTax(
      prisma.id,
      prisma.snapshot_id,
      prisma.order_item_id ?? null,
      prisma.tax_config_id,
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

  static toPrisma(
    domain: PricingSnapshotTax,
  ): Prisma.PricingSnapshotTaxUncheckedCreateInput {
    return {
      ...(domain.id ? { id: domain.id } : {}),
      snapshot_id: domain.snapshotId,
      order_item_id: domain.orderItemId ?? null,
      tax_config_id: domain.taxConfigId,
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
          : null,
      tax_amount:
        domain.taxAmount !== undefined && domain.taxAmount !== null
          ? new Prisma.Decimal(domain.taxAmount)
          : new Prisma.Decimal(0),
    };
  }
}
