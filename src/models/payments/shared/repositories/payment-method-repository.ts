import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/client';
import { Page } from '../../../../common/interfaces';
import { paginationConfig } from '../../../../common/config';
import { PrismaService } from '../../../../providers/prisma/prisma.service';
import { PaymentMethod, PaymentMethodMapper } from '../entities';
import { PaymentMethodNotFoundException } from '../exceptions';
import { PaymentMethodOrderBy, PaymentMethodQueryParams } from '../interfaces';
import { PaymentMethodRepository } from './payment-method-repository.abstract';

@Injectable()
export class PaymentMethodRepositoryImpl implements PaymentMethodRepository {
  private readonly defaultPage = paginationConfig.default.page;
  private readonly defaultPageSize = paginationConfig.default.pageSize;

  constructor(private readonly prismaService: PrismaService) {}

  /**
   * Finds a payment method by its unique identifier.
   *
   * @param id The UUID of the payment method to retrieve.
   * @return The found PaymentMethod domain entity, or null if not found.
   */
  async findById(id: string): Promise<PaymentMethod | null> {
    return await this.prismaService.paymentMethod
      .findUnique({ where: { id } })
      .then((result) => (result ? PaymentMethodMapper.toDomain(result) : null));
  }

  /**
   * Fetches payment methods using pagination, optional filters, and sorting rules.
   *
   * @param params Query parameters for paging, filtering, and ordering.
   */
  async getAllPaged(
    params: PaymentMethodQueryParams,
  ): Promise<Page<PaymentMethod>> {
    const page = params.page ?? this.defaultPage;
    const pageSize = params.pageSize ?? this.defaultPageSize;
    const skip = (page - 1) * pageSize;
    const where = this.buildWhereClause(params);
    const orderBy = this.buildOrderByClause(params.orderBy);

    const [items, total] = await Promise.all([
      this.prismaService.paymentMethod.findMany({
        where,
        skip,
        take: pageSize,
        orderBy,
      }),
      this.prismaService.paymentMethod.count({ where }),
    ]);

    return {
      items: items.map(PaymentMethodMapper.toDomain),
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
    params: PaymentMethodQueryParams,
  ): Prisma.PaymentMethodWhereInput {
    const where: Prisma.PaymentMethodWhereInput = {};

    if (params.filter?.enabledOnly) {
      where.is_active = true;
    }

    return where;
  }

  /**
   * Builds Prisma order-by clauses for payment method listing.
   *
   * @param orderBy Optional list of sorting instructions.
   */
  private buildOrderByClause(
    orderBy: PaymentMethodOrderBy | undefined,
  ):
    | Prisma.PaymentMethodOrderByWithRelationInput
    | Prisma.PaymentMethodOrderByWithRelationInput[] {
    if (!orderBy || orderBy.length === 0) {
      return [{ sort_order: 'asc' }, { created_at: 'desc' }];
    }

    const fieldMap: Record<string, string> = {
      name: 'name',
      feeType: 'fee_type',
      feeValue: 'fee_value',
    };

    return orderBy.map(({ field, direction }) => ({
      [fieldMap[field] ?? field]: direction,
    })) as Prisma.PaymentMethodOrderByWithRelationInput[];
  }

  /**
   * Flips the active status of a payment method by id.
   *
   * @param id Payment method UUID.
   */
  async toggle(id: string): Promise<PaymentMethod> {
    const current = await this.prismaService.paymentMethod.findUnique({
      where: { id },
    });
    if (!current) throw new PaymentMethodNotFoundException(id);

    try {
      return await this.prismaService.paymentMethod
        .update({
          where: { id },
          data: { is_active: !current.is_active },
        })
        .then(PaymentMethodMapper.toDomain);
    } catch (e) {
      if (e instanceof PrismaClientKnownRequestError && e.code === 'P2025') {
        throw new PaymentMethodNotFoundException(id);
      }

      throw e;
    }
  }
}
