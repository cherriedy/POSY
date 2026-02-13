import { Order as DomainOrder } from './order.class';
import { Prisma, Order as PrismaOrder } from '@prisma/client';
import { OrderStatus as DomainOrderStatus } from '../enums';

export class OrderMapper {
  static toDomain(this: void, prisma: PrismaOrder): DomainOrder {
    return new DomainOrder(
      prisma.id,
      prisma.created_by,
      prisma.table_id,
      prisma.session_id,
      prisma.status as DomainOrderStatus,
      prisma.note,
      prisma.subtotal_amount !== null && prisma.subtotal_amount !== undefined
        ? Number(prisma.subtotal_amount)
        : 0,
      prisma.total_amount !== null && prisma.total_amount !== undefined
        ? Number(prisma.total_amount)
        : 0,
      prisma.created_at,
      prisma.updated_at,
    );
  }

  static toPrisma(domain: DomainOrder): PrismaOrder {
    return <PrismaOrder>{
      ...(domain.id ? { id: domain.id } : {}),
      created_by: domain.createdBy,
      table_id: domain.tableId,
      session_id: domain.sessionId,
      status: domain.status,
      note: domain.note,
      subtotal_amount:
        domain.subtotalAmount !== undefined && domain.subtotalAmount !== null
          ? new Prisma.Decimal(domain.subtotalAmount)
          : new Prisma.Decimal(0),
      total_amount:
        domain.totalAmount !== undefined && domain.totalAmount !== null
          ? new Prisma.Decimal(domain.totalAmount)
          : new Prisma.Decimal(0),
      created_at: domain.createdAt ?? undefined,
      updated_at: domain.updatedAt ?? undefined,
    };
  }
}
