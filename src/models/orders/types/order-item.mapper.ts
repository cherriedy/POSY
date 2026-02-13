import { OrderItem as DomainOrderItem } from './order-item.class';
import { Prisma, OrderItem as PrismaOrderItem } from '@prisma/client';
import { OrderItemStatus as DomainOrderItemStatus } from '../enums';
import { OrderMapper } from './order.mapper';
import { ProductMapper } from '../../products/types';
import { OrderTaxMapper } from '../../taxes/types';

export class OrderItemMapper {
  static toDomain(this: void, prisma: PrismaOrderItem): DomainOrderItem {
    return new DomainOrderItem(
      prisma.id,
      prisma.order_id,
      prisma.product_id,
      prisma.quantity ?? 1,
      prisma.unit_price !== null && prisma.unit_price !== undefined
        ? Number(prisma.unit_price)
        : 0,
      prisma.subtotal !== null && prisma.subtotal !== undefined
        ? Number(prisma.subtotal)
        : 0,
      prisma.note,
      prisma.status as DomainOrderItemStatus,
      prisma.started_at,
      prisma.completed_at,
      prisma.served_at,
      prisma.created_at,
      prisma.updated_at,
      // Relations
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      (prisma as any).order
        ? // eslint-disable-next-line @typescript-eslint/no-unsafe-argument,@typescript-eslint/no-unsafe-member-access
          OrderMapper.toDomain((prisma as any).order)
        : null,
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      (prisma as any).product
        ? // eslint-disable-next-line @typescript-eslint/no-unsafe-argument,@typescript-eslint/no-unsafe-member-access
          ProductMapper.toDomain((prisma as any).product)
        : null,
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access,@typescript-eslint/no-unsafe-argument
      (prisma as any).orderTaxes
        ? // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access,@typescript-eslint/no-unsafe-call
          (prisma as any).orderTaxes.map(OrderTaxMapper.toDomain)
        : null,
    );
  }

  static toPrisma(domain: DomainOrderItem): PrismaOrderItem {
    return <PrismaOrderItem>{
      ...(domain.id ? { id: domain.id } : {}),
      order_id: domain.orderId,
      product_id: domain.productId,
      quantity: domain.quantity,
      unit_price:
        domain.unitPrice !== undefined && domain.unitPrice !== null
          ? new Prisma.Decimal(domain.unitPrice)
          : new Prisma.Decimal(0),
      subtotal:
        domain.subtotal !== undefined && domain.subtotal !== null
          ? new Prisma.Decimal(domain.subtotal)
          : new Prisma.Decimal(0),
      note: domain.note,
      status: domain.status,
      started_at: domain.startedAt ?? undefined,
      completed_at: domain.completedAt ?? undefined,
      served_at: domain.servedAt ?? undefined,
      created_at: domain.createdAt ?? undefined,
      updated_at: domain.updatedAt ?? undefined,
    };
  }
}
