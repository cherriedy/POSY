import { PaymentMethod as PrismaPaymentMethod, Prisma } from '@prisma/client';
import { PaymentMethod as DomainPaymentMethod } from './payment-method';
import { PaymentFeeType, PaymentProvider } from '../enums';
import { PaymentMapper } from './payment.mapper';

export class PaymentMethodMapper {
  static toDomain(
    this: void,
    prisma: PrismaPaymentMethod,
  ): DomainPaymentMethod {
    return new DomainPaymentMethod(
      prisma.id,
      prisma.provider as PaymentProvider,
      prisma.name,
      prisma.icon_url,
      prisma.is_active,
      prisma.fee_type as PaymentFeeType | null,
      prisma.fee_value !== null && prisma.fee_value !== undefined
        ? Number(prisma.fee_value)
        : null,
      prisma.sort_order,
      prisma.created_at,
      prisma.updated_at,
      // Relations
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access,@typescript-eslint/no-unsafe-argument
      (prisma as any).payments
        ? // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access,@typescript-eslint/no-unsafe-call
          (prisma as any).payments.map(PaymentMapper.toDomain)
        : null,
    );
  }

  static toPrisma(domain: DomainPaymentMethod): PrismaPaymentMethod {
    return <PrismaPaymentMethod>{
      ...(domain.id ? { id: domain.id } : {}),
      provider: domain.provider,
      name: domain.name,
      icon_url: domain.iconUrl,
      is_active: domain.isActive,
      fee_type: domain.feeType,
      fee_value:
        domain.feeValue !== undefined && domain.feeValue !== null
          ? new Prisma.Decimal(domain.feeValue)
          : null,
      sort_order: domain.sortOrder,
      created_at: domain.createdAt ?? undefined,
      updated_at: domain.updatedAt ?? undefined,
    };
  }
}
