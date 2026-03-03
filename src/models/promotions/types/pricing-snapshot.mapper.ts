import { PricingSnapshot as DomainPricingSnapshot } from './pricing-snapshot.class';
import {
  Prisma,
  PricingSnapshot as PrismaPricingSnapshot,
} from '@prisma/client';
import { PricingSnapshotStatus as DomainPricingSnapshotStatus } from '../enums';

export class PricingSnapshotMapper {
  static toDomain(
    this: void,
    prisma: PrismaPricingSnapshot,
  ): DomainPricingSnapshot {
    return new DomainPricingSnapshot(
      prisma.id,
      prisma.order_id,
      prisma.subtotal_amount !== null && prisma.subtotal_amount !== undefined
        ? Number(prisma.subtotal_amount)
        : 0,
      prisma.discount_amount !== null && prisma.discount_amount !== undefined
        ? Number(prisma.discount_amount)
        : 0,
      prisma.total_tax_amount !== null && prisma.total_tax_amount !== undefined
        ? Number(prisma.total_tax_amount)
        : 0,
      prisma.total_amount !== null && prisma.total_amount !== undefined
        ? Number(prisma.total_amount)
        : 0,
      prisma.status as DomainPricingSnapshotStatus,
      prisma.created_at,
    );
  }

  static toPrisma(domain: DomainPricingSnapshot): PrismaPricingSnapshot {
    return <PrismaPricingSnapshot>{
      ...(domain.id ? { id: domain.id } : {}),
      order_id: domain.orderId,
      subtotal_amount:
        domain.subtotalAmount !== undefined && domain.subtotalAmount !== null
          ? new Prisma.Decimal(domain.subtotalAmount)
          : new Prisma.Decimal(0),
      discount_amount:
        domain.discountAmount !== undefined && domain.discountAmount !== null
          ? new Prisma.Decimal(domain.discountAmount)
          : new Prisma.Decimal(0),
      total_tax_amount:
        domain.totalTaxAmount !== undefined && domain.totalTaxAmount !== null
          ? new Prisma.Decimal(domain.totalTaxAmount)
          : new Prisma.Decimal(0),
      total_amount:
        domain.totalAmount !== undefined && domain.totalAmount !== null
          ? new Prisma.Decimal(domain.totalAmount)
          : new Prisma.Decimal(0),
      status: domain.status,
      created_at: domain.createdAt ?? undefined,
    };
  }
}
