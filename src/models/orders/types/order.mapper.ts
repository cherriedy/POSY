import { Order as DomainOrder } from './order.class';
import { Prisma, Order as PrismaOrder } from '@prisma/client';
import { OrderStatus as DomainOrderStatus } from '../enums';
import { UserMapper } from '../../users/types/user.mapper';
import { TableMapper } from '../../tables/types';
import { TableSessionMapper } from '../../table-sessions/types';
import { OrderItemMapper } from './order-item.mapper';
import { PaymentMapper } from '../../payments/types';

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
      // Relations
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      (prisma as any).user
        ? // eslint-disable-next-line @typescript-eslint/no-unsafe-argument,@typescript-eslint/no-unsafe-member-access
          UserMapper.toDomain((prisma as any).user)
        : null,
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      (prisma as any).table
        ? // eslint-disable-next-line @typescript-eslint/no-unsafe-argument,@typescript-eslint/no-unsafe-member-access
          TableMapper.toDomain((prisma as any).table)
        : null,
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      (prisma as any).session
        ? // eslint-disable-next-line @typescript-eslint/no-unsafe-argument,@typescript-eslint/no-unsafe-member-access
          TableSessionMapper.toDomain((prisma as any).session)
        : null,
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access,@typescript-eslint/no-unsafe-argument
      (prisma as any).orderItems
        ? // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access,@typescript-eslint/no-unsafe-call
          (prisma as any).orderItems.map(OrderItemMapper.toDomain)
        : null,
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access,@typescript-eslint/no-unsafe-argument
      (prisma as any).payments
        ? // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access,@typescript-eslint/no-unsafe-call
          (prisma as any).payments.map(PaymentMapper.toDomain)
        : null,
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
