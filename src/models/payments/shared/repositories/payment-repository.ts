import { Injectable } from '@nestjs/common';
import { Prisma, Payment as PrismaPayment } from '@prisma/client';
import { Page } from '../../../../common/interfaces';
import { paginationConfig } from '../../../../common/config';
import { PrismaService } from '../../../../providers/prisma/prisma.service';
import { Payment, PaymentMapper } from '../entities';
import { PaymentOrderBy, PaymentQueryParams } from '../interfaces';
import { PaymentRepository } from './payment-repository.abstract';
import { DuplicateEntryException } from '../../../../common/exceptions';

@Injectable()
export class PaymentRepositoryImpl implements PaymentRepository {
  private readonly defaultPage = paginationConfig.default.page;
  private readonly defaultPageSize = paginationConfig.default.pageSize;

  constructor(private readonly prismaService: PrismaService) {}

  /**
   * Creates a payment record and returns the mapped domain entity.
   *
   * @param entity Payment domain object to store.
   */
  async create(entity: Payment): Promise<Payment> {
    try {
      const data = PaymentMapper.toPrismaCreate(entity);
      const result: PrismaPayment = await this.prismaService.payment.create({
        data,
        include: {
          method: true,
          order: true,
          user: true,
        },
      });
      return PaymentMapper.toDomain(result);
    } catch (e) {
      if (e instanceof Prisma.PrismaClientKnownRequestError) {
        if (e.code === 'P2002') {
          throw new DuplicateEntryException(
            'Payment with the same unique fields already exists',
          );
        }
      }
      throw e;
    }
  }

  /**
   * Fetches payments using pagination, optional filters, and sorting rules.
   *
   * @param params Query parameters for paging, filtering, and ordering.
   */
  async getAllPaged(params: PaymentQueryParams): Promise<Page<Payment>> {
    const page = params.page ?? this.defaultPage;
    const pageSize = params.pageSize ?? this.defaultPageSize;
    const skip = (page - 1) * pageSize;
    const where = this.buildWhereClause(params);
    const orderBy = this.buildOrderByClause(params.orderBy);

    const [items, total] = await Promise.all([
      this.prismaService.payment.findMany({
        where,
        skip,
        take: pageSize,
        orderBy,
        include: {
          method: true,
          order: true,
          user: true,
        },
      }),
      this.prismaService.payment.count({ where }),
    ]);

    return {
      items: items.map(PaymentMapper.toDomain),
      page,
      pageSize,
      total,
      totalPages: Math.ceil(total / pageSize),
    };
  }

  /**
   * Builds Prisma filter conditions from query params.
   *
   * @param params Query parameters containing optional filters.
   */
  private buildWhereClause(
    params: PaymentQueryParams,
  ): Prisma.PaymentWhereInput {
    const where: Prisma.PaymentWhereInput = {};

    if (params.filter?.orderId) {
      where.order_id = params.filter.orderId;
    }

    if (params.filter?.methodId) {
      where.method_id = params.filter.methodId;
    }

    if (params.filter?.createdBy) {
      where.created_by = params.filter.createdBy;
    }

    if (params.filter?.status) {
      where.status = params.filter.status;
    }

    return where;
  }

  /**
   * Builds Prisma order-by clauses for payment listing.
   *
   * @param orderBy Optional list of sorting instructions.
   */
  private buildOrderByClause(
    orderBy: PaymentOrderBy | undefined,
  ):
    | Prisma.PaymentOrderByWithRelationInput
    | Prisma.PaymentOrderByWithRelationInput[] {
    if (!orderBy || orderBy.length === 0) {
      return { created_at: 'desc' };
    }

    const fieldMap: Record<string, string> = {
      paidAt: 'paid_at',
      createdAt: 'created_at',
      amount: 'amount',
      status: 'status',
    };

    return orderBy.map(({ field, direction }) => ({
      [fieldMap[field] ?? field]: direction,
    })) as Prisma.PaymentOrderByWithRelationInput[];
  }
}
