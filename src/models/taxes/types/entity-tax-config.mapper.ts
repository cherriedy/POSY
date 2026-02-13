import { EntityTaxConfig as DomainEntityTaxConfig } from './entity-tax-config.class';
import {
  Prisma,
  EntityTaxConfig as PrismaEntityTaxConfig,
  TaxConfig as PrismaTaxConfig,
  TaxConfigEntityType,
} from '@prisma/client';
import { TaxConfigMapper } from './tax-config.mapper';

export class EntityTaxConfigMapper {
  static toDomain(
    this: void,
    prisma: PrismaEntityTaxConfig & { tax?: PrismaTaxConfig },
  ): DomainEntityTaxConfig {
    return new DomainEntityTaxConfig(
      prisma.id,
      prisma.tax_id,
      prisma.entity_id,
      prisma.entity_type,
      prisma.is_active ?? true,
      prisma.note ?? null,
      prisma.created_at,
      prisma.updated_at,
      // Relations
      prisma.tax ? TaxConfigMapper.toDomain(prisma.tax) : null,
    );
  }

  static toPrisma(
    domain: DomainEntityTaxConfig,
  ): Prisma.EntityTaxConfigCreateInput {
    return {
      ...(domain.id ? { id: domain.id } : {}),
      tax: {
        connect: { id: domain.taxId },
      },
      entity_id: domain.entityId,
      entity_type: domain.entityType as TaxConfigEntityType,
      is_active:
        domain.isActive !== undefined && domain.isActive !== null
          ? domain.isActive
          : true,
      note: domain.note ?? undefined,
      created_at: domain.createdAt ?? undefined,
      updated_at: domain.updatedAt ?? undefined,
    };
  }
}
