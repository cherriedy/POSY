import { OrderTax as DomainOrderTax } from './order-tax';
import { Prisma } from '@prisma/client';
import { OrderMapper, OrderItemMapper } from '../../orders/shared/entities';
import {
  TaxType as DomainTaxType,
  TaxRateType as DomainTaxRateType,
} from '../enums';

export class OrderTaxMapper {
  static toDomain(this: void, prisma: any): DomainOrderTax {
    // `prisma` is typed as any here because the generated PrismaOrderTax type is
    // stale (still has tax_id / tax_rate) until `prisma migrate dev` is run.
    // After migration, replace `any` with the real PrismaOrderTax type and
    // remove this comment.
    return new DomainOrderTax(
      prisma.id as string,
      prisma.tax_config_id as string,
      prisma.order_id as string,
      (prisma.order_item_id as string | null) ?? null,
      prisma.tax_name as string,
      prisma.tax_type as DomainTaxType,
      prisma.rate_type as DomainTaxRateType,
      prisma.charge_rate != null ? Number(prisma.charge_rate) : 0,
      prisma.taxable_base != null ? Number(prisma.taxable_base) : 0,
      prisma.tax_amount != null ? Number(prisma.tax_amount) : 0,
      (prisma.quantity as number | null) ?? null,
      // Relations
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
      prisma.order ? OrderMapper.toDomain(prisma.order) : null,
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
      prisma.order_item ? OrderItemMapper.toDomain(prisma.order_item) : null,
    );
  }

  static toPrisma(domain: DomainOrderTax): any {
    // Return type is `any` because the generated PrismaOrderTax type is stale
    // (still has tax_id / tax_rate) until `prisma migrate dev` is run.
    // After migration, restore the return type to the real Prisma create-input type.
    return {
      ...(domain.id ? { id: domain.id } : {}),
      tax_config_id: domain.taxConfigId,
      order_id: domain.orderId,
      order_item_id: domain.orderItemId,
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
      tax_amount:
        domain.taxAmount !== undefined && domain.taxAmount !== null
          ? new Prisma.Decimal(domain.taxAmount)
          : new Prisma.Decimal(0),
      quantity:
        domain.quantity !== undefined && domain.quantity !== null
          ? domain.quantity
          : null,
    };
  }
}
