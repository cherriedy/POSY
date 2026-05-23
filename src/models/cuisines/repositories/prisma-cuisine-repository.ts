import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../providers/prisma/prisma.service';
import { CuisineRepository } from './cuisine-repository.abstract';
import { Cuisine } from '../types/cuisine.class';
import { CuisineMapper } from '../types/cuisine.mapper';
import { Page } from '../../../common/interfaces/page.interface';
import { CuisineOrderBy, CuisineQueryParams } from '../interfaces/cuisine-query-params.interface';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/client';
import { DuplicateEntryError } from '../../../common/errors/duplicate-entry.error';
import { ForeignKeyViolationError } from '../../../common/errors/foreign-key-violation.error';
import { CuisineNotFoundException } from '../exceptions/cuisine-not-found.exception';
import { paginationConfig } from '../../../common/constants/pagination.config';
import { camelCaseToSnakeCase } from '../../../common/utilities/string.util';
import { Prisma } from '@prisma/client';

@Injectable()
export class PrismaCuisineRepository implements CuisineRepository {
  private readonly defaultPage = paginationConfig.default.page;
  private readonly defaultPageSize = paginationConfig.default.pageSize;

  constructor(private readonly prismaService: PrismaService) {}

  async create(entity: Cuisine): Promise<Cuisine> {
    try {
      const prismaData = CuisineMapper.toPrisma(entity);
      const created = await this.prismaService.cuisine.create({
        data: prismaData,
      });
      return CuisineMapper.toDomain(created);
    } catch (e) {
      if (e instanceof PrismaClientKnownRequestError) {
        if (e.code === 'P2002') {
          throw new DuplicateEntryError(
            'Cuisine with this name already exists',
          );
        }
        if (e.code === 'P2003') {
          throw new ForeignKeyViolationError(entity);
        }
      }
      throw e;
    }
  }

  async findById(id: string): Promise<Cuisine | null> {
    const cuisine = await this.prismaService.cuisine.findFirst({
      where: {
        id,
        is_deleted: false,
      },
    });
    return cuisine ? CuisineMapper.toDomain(cuisine) : null;
  }

  async delete(id: string): Promise<void> {
    const cuisine = await this.findById(id);
    if (!cuisine) throw new CuisineNotFoundException(id);
    await this.update(id, { isDeleted: true, deletedAt: new Date() });
  }

  async update(id: string, entity: Partial<Cuisine>): Promise<Cuisine> {
    try {
      const dataSnakeCase = Object.entries(entity).reduce(
        (acc, [key, value]) => {
          const snakeKey = camelCaseToSnakeCase(key);
          acc[snakeKey] = value;
          return acc;
        },
        {} as Record<string, any>,
      );

      const updated = await this.prismaService.cuisine.update({
        where: { id },
        data: dataSnakeCase,
      });
      return CuisineMapper.toDomain(updated);
    } catch (e) {
      if (e instanceof PrismaClientKnownRequestError) {
        if (e.code === 'P2025') {
          throw new CuisineNotFoundException(id);
        }
        if (e.code === 'P2002') {
          throw new DuplicateEntryError(
            'Cuisine with this name already exists',
          );
        }
      }
      throw e;
    }
  }

  async getAllPaged(params: CuisineQueryParams): Promise<Page<Cuisine>> {
    const page = params.page ?? this.defaultPage;
    const pageSize = params.pageSize ?? this.defaultPageSize;
    const skip = (page - 1) * pageSize;
    const where = this.buildWhereClause(params);
    const orderBy = this.buildOrderByClause(params.orderBy);

    const [items, total] = await Promise.all([
      this.prismaService.cuisine.findMany({
        where,
        orderBy,
        skip,
        take: pageSize,
      }),
      this.prismaService.cuisine.count({ where }),
    ]);

    return {
      items: items.map((item) => CuisineMapper.toDomain(item)),
      page,
      pageSize,
      total,
      totalPages: Math.ceil(total / pageSize),
    };
  }

  private buildOrderByClause(
    orderBy: CuisineOrderBy | null,
  ): Prisma.CuisineOrderByWithRelationInput {
    if (!orderBy || orderBy.length === 0) {
      return { name: 'asc' };
    }

    const mapping: Record<string, string> = {
      createdAt: 'created_at',
      updatedAt: 'updated_at',
      name: 'name',
      region: 'region',
    };

    const orderByClause: Prisma.CuisineOrderByWithRelationInput = {};

    for (const { field, direction } of orderBy) {
      const prismaField = mapping[field];

      if (!prismaField) {
        throw new Error(`Invalid sort field: ${field}`);
      }

      orderByClause[prismaField] = direction;
    }

    return orderByClause;
  }

  private buildWhereClause(
    params: CuisineQueryParams | null,
  ): Prisma.CuisineWhereInput {
    if (!params) return { is_deleted: false };

    const where: Prisma.CuisineWhereInput = {};
    if (params.filter?.query) {
      where.OR = [
        { name: { contains: params.filter.query, mode: 'insensitive' } },
        { region: { contains: params.filter.query, mode: 'insensitive' } },
      ];
    }
    if (params.filter?.isDeleted) {
      where.is_deleted = params.filter.isDeleted;
    }
    return where;
  }
}
