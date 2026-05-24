import { FloorRepository } from './floor-repository.abstract';
import { Floor } from '../entities/floor';
import { FloorMapper } from '../entities/floor.mapper';
import { PrismaService } from '@posy/shared';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/client';
import { DuplicateEntryError } from '@posy/shared';
import { ForeignKeyViolationError } from '@posy/shared';
import { paginationConfig } from '@posy/shared';
import { Page } from '@posy/shared';
import { camelCaseToSnakeCase } from '@posy/shared';
import { Injectable } from '@nestjs/common';
import { FloorNotFoundException } from '../errors/floor-not-found.exception';
import {
  FloorOrderBy,
  FloorQueryFilter,
  FloorQueryParams,
} from '../interfaces/floor-query-params.interface';
import { Prisma } from '@prisma/client';

@Injectable()
export class PrismaFloorRepository implements FloorRepository {
  private readonly pageDefault = paginationConfig.default.page;
  private readonly pageSizeDefault = paginationConfig.default.pageSize;

  constructor(private readonly prismaService: PrismaService) {}

  async create(entity: Floor): Promise<Floor> {
    const prismaFloor = FloorMapper.toPrisma(entity);
    try {
      return await this.prismaService.floor
        .create({ data: prismaFloor })
        .then(FloorMapper.toDomain);
    } catch (e) {
      if (e instanceof PrismaClientKnownRequestError) {
        if (e.code === 'P2002') {
          throw new DuplicateEntryError(
            'Floor with provided unique field already exists',
          );
        }
      }
      throw e;
    }
  }

  async delete(id: string): Promise<void> {
    try {
      await this.prismaService.floor.delete({ where: { id } });
    } catch (e) {
      if (e instanceof PrismaClientKnownRequestError) {
        if (e.code === 'P2025') {
          throw new FloorNotFoundException(id);
        } else if (e.code === 'P2003') {
          const fields = e.meta?.field_name as string[];
          throw new ForeignKeyViolationError(fields);
        }
      }
      throw e;
    }
  }

  async findById(id: string): Promise<Floor | null> {
    const prismaFloor = await this.prismaService.floor.findUnique({
      where: { id },
      include: {
        zones: true,
      },
    });

    return prismaFloor ? FloorMapper.toDomain(prismaFloor) : null;
  }

  async findByIds(ids: string[]): Promise<Floor[]> {
    return this.prismaService.floor
      .findMany({
        where: {
          id: { in: ids },
        },
        include: {
          zones: true,
        },
      })
      .then((items) => items.map(FloorMapper.toDomain));
  }

  async update(id: string, entity: Partial<Floor>): Promise<Floor> {
    const floor = await this.findById(id);
    if (!floor) throw new FloorNotFoundException(id);

    const dataSnakeCase = Object.entries(entity).reduce(
      (acc, [key, value]) => {
        const snakeKey = camelCaseToSnakeCase(key);
        acc[snakeKey] = value;
        return acc;
      },
      {} as Record<string, any>,
    );

    if (dataSnakeCase.name && typeof dataSnakeCase.name === 'string') {
      const existing = await this.prismaService.floor.findUnique({
        where: { name: dataSnakeCase.name },
      });
      if (existing && existing.id !== id) {
        throw new DuplicateEntryError('Floor name already exists.');
      }
    }

    try {
      return await this.prismaService.floor
        .update({
          where: { id },
          data: dataSnakeCase,
          include: { zones: true },
        })
        ?.then(FloorMapper.toDomain);
    } catch (e) {
      if (e instanceof PrismaClientKnownRequestError) {
        if (e.code === 'P2002') {
          throw new DuplicateEntryError(e.message);
        }
      }
      throw e;
    }
  }

  async getAllPaged(params: FloorQueryParams): Promise<Page<Floor>> {
    const {
      page = this.pageDefault,
      pageSize = this.pageSizeDefault,
      filter,
      orderBy: pairs,
    } = params;

    const where = this.buildWhereClause(filter);
    const orderBy = this.buildOrderByClause(pairs);

    const [items, total] = await Promise.all([
      this.prismaService.floor.findMany({
        where,
        orderBy,
        skip: (page - 1) * pageSize,
        take: pageSize,
        include: { zones: true },
      }),
      this.prismaService.floor.count({ where }),
    ]);

    return {
      items: items.map((f) => FloorMapper.toDomain(f)),
      page,
      pageSize,
      total,
      totalPages: Math.ceil(total / pageSize),
    };
  }

  private buildOrderByClause(
    pairs?: FloorOrderBy,
  ):
    | Prisma.FloorOrderByWithRelationInput
    | Prisma.FloorOrderByWithRelationInput[] {
    if (!pairs || pairs.length === 0) {
      return { order: 'asc' };
    }

    const mapping: Record<string, string> = {
      name: 'name',
      order: 'order',
      createdAt: 'created_at',
      updatedAt: 'updated_at',
    };

    return pairs.map((pair) => {
      const snakeField = mapping[pair.field] || pair.field;
      return { [snakeField]: pair.direction };
    });
  }

  private buildWhereClause(filters?: FloorQueryFilter): Prisma.FloorWhereInput {
    if (!filters) return {};

    const where: Prisma.FloorWhereInput = {};

    if (filters.query) {
      where.name = {
        contains: filters.query,
        mode: 'insensitive',
      };
    }

    if (filters.isActive !== undefined) {
      where.is_active = filters.isActive;
    }

    return where;
  }
}
