import { Payment as PrismaPayment, Prisma } from '@prisma/client';
import { Payment as DomainPayment } from './payment.class';
import { PaymentStatus as DomainPaymentStatus } from '../enums';
import { OrderMapper } from '../../orders/types';
import { UserMapper } from '../../users/types/user.mapper';
import { PaymentMethodMapper } from './payment-method.mapper';

export class PaymentMapper {
  static toDomain(this: void, prisma: PrismaPayment): DomainPayment {
    return new DomainPayment(
      prisma.id,
      prisma.method_id,
      prisma.order_id,
      prisma.created_by,
      prisma.amount !== null && prisma.amount !== undefined
        ? Number(prisma.amount)
        : 0,
      prisma.fee_amount !== null && prisma.fee_amount !== undefined
        ? Number(prisma.fee_amount)
        : null,
      prisma.reference_number,
      prisma.status as DomainPaymentStatus,
      prisma.payment_url,
      prisma.paid_at,
      prisma.expired_at,
      prisma.metadata as Record<string, any> | null,
      prisma.created_at,
      prisma.updated_at,
      // Relations
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      (prisma as any).order
        ? // eslint-disable-next-line @typescript-eslint/no-unsafe-argument,@typescript-eslint/no-unsafe-member-access
          OrderMapper.toDomain((prisma as any).order)
        : null,
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access,@typescript-eslint/no-unsafe-argument
      (prisma as any).method
        ? // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
          PaymentMethodMapper.toDomain((prisma as any).method)
        : null,
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      (prisma as any).user
        ? // eslint-disable-next-line @typescript-eslint/no-unsafe-argument,@typescript-eslint/no-unsafe-member-access
          UserMapper.toDomain((prisma as any).user)
        : null,
    );
  }

  static toPrisma(domain: DomainPayment): PrismaPayment {
    return <PrismaPayment>{
      ...(domain.id ? { id: domain.id } : {}),
      method_id: domain.methodId,
      order_id: domain.orderId,
      created_by: domain.createdBy,
      amount:
        domain.amount !== undefined && domain.amount !== null
          ? new Prisma.Decimal(domain.amount)
          : new Prisma.Decimal(0),
      fee_amount:
        domain.feeAmount !== undefined && domain.feeAmount !== null
          ? new Prisma.Decimal(domain.feeAmount)
          : null,
      reference_number: domain.referenceNumber,
      status: domain.status,
      payment_url: domain.paymentUrl,
      paid_at: domain.paidAt ?? null,
      expired_at: domain.expiredAt ?? null,
      metadata: domain.metadata ?? null,
      created_at: domain.createdAt ?? undefined,
      updated_at: domain.updatedAt ?? undefined,
    };
  }
}
