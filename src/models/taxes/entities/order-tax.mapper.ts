import { OrderTax as DomainOrderTax } from './order-tax.class';
import { Prisma, OrderTax as PrismaOrderTax } from '@prisma/client';
import { TaxConfigMapper } from './tax-config.mapper';
import { OrderMapper } from '../../orders/types';
import { OrderItemMapper } from '../../orders/types';

export class OrderTaxMapper {
  static toDomain(this: void, prisma: PrismaOrderTax): DomainOrderTax {
    return new DomainOrderTax(
      prisma.id,
      prisma.tax_id,
      prisma.order_id,
      prisma.order_item_id ?? null,
      prisma.tax_name,
      prisma.tax_rate !== null && prisma.tax_rate !== undefined
        ? Number(prisma.tax_rate)
        : 0,
      prisma.taxable_base !== null && prisma.taxable_base !== undefined
        ? Number(prisma.taxable_base)
        : 0,
      prisma.tax_amount !== null && prisma.tax_amount !== undefined
        ? Number(prisma.tax_amount)
        : 0,
      prisma.quantity ?? null,
      // Relations
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      (prisma as any).order
        ? // eslint-disable-next-line @typescript-eslint/no-unsafe-argument,@typescript-eslint/no-unsafe-member-access
          OrderMapper.toDomain((prisma as any).order)
        : null,
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      (prisma as any).tax
        ? // eslint-disable-next-line @typescript-eslint/no-unsafe-argument,@typescript-eslint/no-unsafe-member-access
          TaxConfigMapper.toDomain((prisma as any).tax)
        : null,
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      (prisma as any).order_item
        ? // eslint-disable-next-line @typescript-eslint/no-unsafe-argument,@typescript-eslint/no-unsafe-member-access
          OrderItemMapper.toDomain((prisma as any).order_item)
        : null,
    );
  }

  static toPrisma(domain: DomainOrderTax): PrismaOrderTax {
    return <PrismaOrderTax>{
      ...(domain.id ? { id: domain.id } : {}),
      tax_id: domain.taxId,
      order_id: domain.orderId,
      order_item_id: domain.orderItemId,
      tax_name: domain.taxName,
      tax_rate:
        domain.taxRate !== undefined && domain.taxRate !== null
          ? new Prisma.Decimal(domain.taxRate)
          : new Prisma.Decimal(0),
      taxable_base:
        domain.taxableBase !== undefined && domain.taxableBase !== null
          ? new Prisma.Decimal(domain.taxableBase)
          : new Prisma.Decimal(0),
      tax_amount:
        domain.taxAmount !== undefined && domain.taxAmount !== null
          ? new Prisma.Decimal(domain.taxAmount)
          : new Prisma.Decimal(0),
      quantity:
        domain.quantity !== undefined && domain.quantity !== null
          ? domain.quantity
          : undefined,
    };
  }
}
