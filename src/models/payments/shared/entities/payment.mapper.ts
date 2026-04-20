import { Payment as PrismaPayment, Prisma } from '@prisma/client';
import { Payment as DomainPayment } from './payment';
import { PaymentStatus as DomainPaymentStatus } from '../enums';
import { OrderMapper } from '../../../orders/shared/entities';
import { UserMapper } from '../../../users/types/user.mapper';
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
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
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

  static toPrismaCreate(
    domain: DomainPayment,
  ): Prisma.PaymentUncheckedCreateInput {
    return {
      ...(domain.id ? { id: domain.id } : {}),
      method_id: domain.methodId,
      order_id: domain.orderId,
      created_by: domain.createdBy,
      amount: domain.amount,
      fee_amount: domain.feeAmount,
      reference_number: domain.referenceNumber,
      status: domain.status,
      payment_url: domain.paymentUrl,
      paid_at: domain.paidAt,
      expired_at: domain.expiredAt,
      metadata: domain.metadata ?? Prisma.DbNull,
      ...(domain.createdAt ? { created_at: domain.createdAt } : {}),
    };
  }

  static toPrismaUpdate(
    domain: Partial<DomainPayment>,
  ): Prisma.PaymentUncheckedUpdateInput {
    const updateData: Prisma.PaymentUncheckedUpdateInput = {};

    if (domain.methodId) {
      updateData.method_id = domain.methodId;
    }

    if (domain.orderId) {
      updateData.order_id = domain.orderId;
    }

    if (domain.createdBy) {
      updateData.created_by = domain.createdBy;
    }

    if (domain.amount !== undefined) {
      updateData.amount = domain.amount;
    }

    if (domain.feeAmount !== undefined) {
      updateData.fee_amount = domain.feeAmount;
    }

    if (domain.referenceNumber) {
      updateData.reference_number = domain.referenceNumber;
    }

    if (domain.status) {
      updateData.status = domain.status;
    }

    if (domain.paymentUrl) {
      updateData.payment_url = domain.paymentUrl;
    }

    if (domain.paidAt) {
      updateData.paid_at = domain.paidAt;
    }

    if (domain.expiredAt) {
      updateData.expired_at = domain.expiredAt;
    }

    if (domain.metadata !== undefined) {
      updateData.metadata = domain.metadata ?? Prisma.DbNull;
    }

    return updateData;
  }
}
