import { TableRepository } from './table-repository.abstract';
import { Table } from '../entities/table';
import { TableMapper } from '../entities/table.mapper';
import { PrismaService } from '@posy/shared';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/client';
import { DuplicateEntryError } from '@posy/shared';
import { ForeignKeyViolationError } from '@posy/shared';
import { paginationConfig } from '@posy/shared';
import { Page } from '@posy/shared';
import { camelCaseToSnakeCase } from '@posy/shared';
import { Injectable } from '@nestjs/common';
import { TableNotFoundException } from '../errors/table-not-found.exception';
import { TableOrderBy, TableQueryFilter, TableQueryParams } from '../interfaces/table-query-params.interface';
import { Prisma } from '@prisma/client';

@Injectable()
export class PrismaTableRepository implements TableRepository {
  private readonly pageDefault = paginationConfig.default.page;
  private readonly pageSizeDefault = paginationConfig.default.pageSize;

  constructor(private readonly prismaService: PrismaService) {}

  async create(entity: Table): Promise<Table> {
    const prismaTable = TableMapper.toPrisma(entity);
    try {
      return await this.prismaService.table
        .create({
          data: prismaTable,
          include: {
            zone: {
              include: {
                floor: true,
              },
            },
          },
        })
        .then(TableMapper.toDomain);
    } catch (e) {
      if (e instanceof PrismaClientKnownRequestError) {
        if (e.code === 'P2002') {
          throw new DuplicateEntryError(
            'Table with provided unique field already exists',
          );
        }
      }
      throw e;
    }
  }

  async delete(id: string): Promise<void> {
    try {
      await this.prismaService.table.delete({ where: { id } });
    } catch (e) {
      if (e instanceof PrismaClientKnownRequestError) {
        if (e.code === 'P2025') {
          throw new TableNotFoundException(id);
        } else if (e.code === 'P2003') {
          const fields = e.meta?.field_name as string[];
          throw new ForeignKeyViolationError(fields);
        }
      }
      throw e;
    }
  }

  async findById(id: string): Promise<Table | null> {
    const prismaTable = await this.prismaService.table.findUnique({
      where: { id },
      include: { zone: true },
    });

    return prismaTable ? TableMapper.toDomain(prismaTable) : null;
  }

  async findIdleTables(): Promise<Table[]> {
    const tables = await this.prismaService.table.findMany({
      where: { is_active: true, sessions: { none: {} } },
      include: { zone: { include: { floor: true } } },
    });
    return tables.map((t) => TableMapper.toDomain(t));
  }

  async update(id: string, entity: Partial<Table>): Promise<Table> {
    const dataSnakeCase = Object.entries(entity).reduce(
      (acc, [key, value]) => {
        const snakeKey = camelCaseToSnakeCase(key);
        acc[snakeKey] = value;
        return acc;
      },
      {} as Record<string, any>,
    );

    try {
      return await this.prismaService.table
        .update({
          where: { id },
          data: dataSnakeCase,
          include: {
            zone: {
              include: {
                floor: true,
              },
            },
          },
        })
        ?.then(TableMapper.toDomain);
    } catch (e) {
      if (e instanceof PrismaClientKnownRequestError) {
        if (e.code === 'P2002') {
          throw new DuplicateEntryError(
            'Table name already exists in this zone.',
          );
        }
      }
      throw e;
    }
  }

  async getAllPaged(params: TableQueryParams): Promise<Page<Table>> {
    const {
      page = this.pageDefault,
      pageSize = this.pageSizeDefault,
      filter,
      orderBy: pairs,
    } = params;

    const where = this.buildWhereClause(filter);
    const orderBy = this.buildOrderByClause(pairs);

    const [items, total] = await Promise.all([
      this.prismaService.table.findMany({
        where,
        orderBy,
        skip: (page - 1) * pageSize,
        take: pageSize,
        include: {
          zone: {
            include: {
              floor: true,
            },
          },
        },
      }),
      this.prismaService.table.count({ where }),
    ]);

    return {
      items: items.map((t) => TableMapper.toDomain(t)),
      page,
      pageSize,
      total,
      totalPages: Math.ceil(total / pageSize),
    };
  }

  private buildOrderByClause(
    pairs?: TableOrderBy,
  ):
    | Prisma.TableOrderByWithRelationInput
    | Prisma.TableOrderByWithRelationInput[] {
    if (!pairs || pairs.length === 0) {
      return { name: 'asc' };
    }

    const mapping: Record<string, string> = {
      name: 'name',
      capacity: 'capacity',
      status: 'status',
      createdAt: 'created_at',
      updatedAt: 'updated_at',
    };

    return pairs.map((pair) => {
      const snakeField = mapping[pair.field] || pair.field;
      return { [snakeField]: pair.direction };
    });
  }

  private buildWhereClause(filters?: TableQueryFilter): Prisma.TableWhereInput {
    if (!filters) return {};

    const where: Prisma.TableWhereInput = {};

    if (filters.query) {
      where.name = {
        contains: filters.query,
        mode: 'insensitive',
      };
    }

    if (filters.isActive !== undefined) {
      where.is_active = filters.isActive;
    }

    if (filters.status) {
      where.status = filters.status;
    }

    if (filters.zoneId) {
      where.zone_id = filters.zoneId;
    }

    return where;
  }
}
