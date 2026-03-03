import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../providers/prisma/prisma.service';
import { OrderRepository } from './order.repository-abstract';
import { Order, OrderMapper } from '../types';
import { Page } from '../../../common/interfaces';
import { OrderQueryParams } from '../interfaces';
import {
  DuplicateEntryException,
  ForeignKeyViolationException,
} from '../../../common/exceptions';
import { OrderNotFoundException } from '../exceptions';
import { paginationConfig } from '../../../common/config';
import { Prisma } from '@prisma/client';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/client';

@Injectable()
export class OrderRepositoryImpl implements OrderRepository {
  private readonly defaultPage = paginationConfig.default.page;
  private readonly defaultPageSize = paginationConfig.default.pageSize;
  private readonly include: Prisma.OrderInclude = {
    user: true,
    table: true,
    session: true,
    orderItems: {
      include: {
        product: true,
        orderTaxes: true,
      },
    },
  };

  constructor(private readonly prismaService: PrismaService) {}

  // ------------------------------------------------------------------
  // Private Helpers
  // ------------------------------------------------------------------

  /**
   * Builds a strongly-typed Prisma `where` clause
   * from provided query parameters.
   *
   * Only defined filters are applied. Undefined values
   * are intentionally ignored to avoid unintended constraints.
   *
   * ### Supported Filters
   * - `sessionId` → Orders belonging to a specific session
   * - `tableId` → Orders assigned to a table
   * - `createdBy` → Orders created by a user
   * - `status` → Orders matching a specific status
   *
   * @param params - Pagination + filter parameters
   * @returns Prisma-compatible `OrderWhereInput`
   */
  private buildWhereClause(params: OrderQueryParams): Prisma.OrderWhereInput {
    const filter = params.filter;
    if (!filter) return {};

    const where: Prisma.OrderWhereInput = {};

    if (filter.sessionId) where.session_id = filter.sessionId;
    if (filter.tableId) where.table_id = filter.tableId;
    if (filter.createdBy) where.created_by = filter.createdBy;
    if (filter.status) where.status = filter.status;

    return where;
  }

  // ------------------------------------------------------------------
  // Public Repository Methods
  // ------------------------------------------------------------------

  /**
   * Persists a new Order.
   *
   * ### Error Translation
   * - `P2002` → DuplicateEntryException
   * - `P2003` → ForeignKeyViolationException
   *
   * @param entity - Order aggregate to persist
   * @returns Created Order domain entity
   * @throws DuplicateEntryException
   * @throws ForeignKeyViolationException
   */
  async create(entity: Order): Promise<Order> {
    try {
      const prisma = OrderMapper.toPrisma(entity);

      const created = await this.prismaService.order.create({
        data: prisma,
        include: this.include,
      });

      return OrderMapper.toDomain(created);
    } catch (e) {
      if (e instanceof PrismaClientKnownRequestError) {
        if (e.code === 'P2002') {
          throw new DuplicateEntryException(
            'Order with provided data already exists',
          );
        }
        if (e.code === 'P2003') {
          throw new ForeignKeyViolationException(entity);
        }
      }
      throw e;
    }
  }

  /**
   * Retrieves an Order by its unique identifier.
   *
   * @param id - Order UUID
   * @returns Order if found, otherwise `null`
   */
  async findById(id: string): Promise<Order | null> {
    const order = await this.prismaService.order.findUnique({
      where: { id },
      include: this.include,
    });

    return order ? OrderMapper.toDomain(order) : null;
  }

  /**
   * Deletes an Order by ID.
   *
   * @param id - Order UUID
   * @throws OrderNotFoundException if order does not exist
   */
  async delete(id: string): Promise<void> {
    const order = await this.findById(id);
    if (!order) throw new OrderNotFoundException(id);

    await this.prismaService.order.delete({ where: { id } });
  }

  /**
   * Updates mutable fields of an existing Order.
   *
   * Only explicitly provided fields are updated.
   * Undefined fields remain unchanged.
   *
   * @param id - Order UUID
   * @param entity - Partial Order containing updatable fields
   * @returns Updated Order domain entity
   * @throws OrderNotFoundException
   */
  async update(id: string, entity: Partial<Order>): Promise<Order> {
    const existing = await this.findById(id);
    if (!existing) throw new OrderNotFoundException(id);

    try {
      const updated = await this.prismaService.order.update({
        where: { id },
        data: {
          status: entity.status,
          note: entity.note,
          subtotal_amount:
            entity.subtotalAmount !== undefined
              ? entity.subtotalAmount
              : undefined,
          total_amount:
            entity.totalAmount !== undefined ? entity.totalAmount : undefined,
        },
        include: this.include,
      });

      return OrderMapper.toDomain(updated);
    } catch (e) {
      if (e instanceof PrismaClientKnownRequestError && e.code === 'P2025') {
        throw new OrderNotFoundException(id);
      }
      throw e;
    }
  }

  /**
   * Retrieves a paginated list of Orders.
   *
   * ### Features
   * - Offset-based pagination (`skip` + `take`)
   * - Optional filtering
   * - Deterministic ordering (`created_at DESC`)
   * - Parallelized count + fetch query
   *
   * ### Defaults
   * If `page` or `pageSize` are not provided,
   * repository defaults are applied.
   *
   * @param params - Pagination and filter parameters
   * @returns Page<Order> containing:
   * - `items`
   * - `page`
   * - `pageSize`
   * - `total`
   * - `totalPages`
   */
  async getAllPaged(params: OrderQueryParams): Promise<Page<Order>> {
    const page = params.page ?? this.defaultPage;
    const pageSize = params.pageSize ?? this.defaultPageSize;
    const skip = (page - 1) * pageSize;

    const where = this.buildWhereClause(params);

    const [total, orders] = await Promise.all([
      this.prismaService.order.count({ where }),
      this.prismaService.order.findMany({
        where,
        skip,
        take: pageSize,
        orderBy: { created_at: 'desc' },
        include: this.include,
      }),
    ]);

    return {
      items: orders.map(OrderMapper.toDomain),
      page,
      pageSize,
      total,
      totalPages: Math.ceil(total / pageSize),
    };
  }
}
