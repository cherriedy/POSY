import { TaxConfig as DomainTaxConfig } from './tax-config.class';
import { Prisma, TaxConfig as PrismaTaxConfig } from '@prisma/client';
import {
  TaxType as DomainTaxType,
  TaxRateType as DomainTaxRateType,
} from '../enums';

export class TaxConfigMapper {
  static toDomain(this: void, prisma: PrismaTaxConfig): DomainTaxConfig {
    return new DomainTaxConfig(
      prisma.id,
      prisma.type as DomainTaxType,
      prisma.name,
      prisma.display_name,
      prisma.description ?? null,
      prisma.rate_type as DomainTaxRateType,
      prisma.charge_rate !== null && prisma.charge_rate !== undefined
        ? Number(prisma.charge_rate)
        : 0,
      prisma.is_active ?? true,
      prisma.is_included ?? false,
      prisma.apply_after_vat ?? false,
      prisma.sort_order ?? 0,
      prisma.is_deleted ?? false,
      prisma.deleted_at ?? null,
      prisma.created_at,
      prisma.updated_at,
      // Relations
      null, // orderTaxes - not loaded by default
      null, // pricingSnapshotTaxes - not loaded by default
    );
  }

  static toPrisma(domain: DomainTaxConfig): Prisma.TaxConfigCreateInput {
    return {
      ...(domain.id ? { id: domain.id } : {}),
      type: domain.type,
      name: domain.name,
      display_name: domain.displayName,
      description: domain.description,
      rate_type: domain.rateType,
      charge_rate:
        domain.chargeRate !== undefined && domain.chargeRate !== null
          ? new Prisma.Decimal(domain.chargeRate)
          : new Prisma.Decimal(0),
      is_active:
        domain.isActive !== undefined && domain.isActive !== null
          ? domain.isActive
          : true,
      is_included:
        domain.isIncluded !== undefined && domain.isIncluded !== null
          ? domain.isIncluded
          : false,
      apply_after_vat:
        domain.applyAfterVAT !== undefined && domain.applyAfterVAT !== null
          ? domain.applyAfterVAT
          : false,
      sort_order:
        domain.sortOrder !== undefined && domain.sortOrder !== null
          ? domain.sortOrder
          : 0,
      is_deleted:
        domain.isDeleted !== undefined && domain.isDeleted !== null
          ? domain.isDeleted
          : false,
      deleted_at:
        domain.deletedAt !== undefined && domain.deletedAt !== null
          ? domain.deletedAt
          : undefined,
      created_at: domain.createdAt ?? undefined,
      updated_at: domain.updatedAt ?? undefined,
    };
  }
}
