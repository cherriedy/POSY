import { Injectable } from '@nestjs/common';
import { IngredientRepository } from './ingredient-repository.abstract';
import { Ingredient, IngredientMapper } from '../entities';
import { Page } from '../../../common/interfaces';
import { PrismaService } from '../../../providers/prisma/prisma.service';
import {
  DuplicateEntryException,
  ForeignKeyViolationException,
} from '../../../common/exceptions';
import { paginationConfig } from '../../../common/config';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/client';
import { Prisma } from '@prisma/client';
import { IngredientQueryParams, IngredientOrderBy } from '../interfaces';
import { IngredientNotFoundException } from '../exceptions';

const { page: defaultPage, pageSize: defaultPageSize } =
  paginationConfig.default;

@Injectable()
export class IngredientRepositoryImpl implements IngredientRepository {
  constructor(private readonly prismaService: PrismaService) {}

  async create(entity: Ingredient): Promise<Ingredient> {
    try {
      const prisma = IngredientMapper.toPrisma(entity);
      return await this.prismaService.ingredient
        .create({
          data: prisma,
          include: { vendor: true, unit: true },
        })
        .then(IngredientMapper.toDomain);
    } catch (e) {
      if (e instanceof PrismaClientKnownRequestError) {
        if (e.code === 'P2002') {
          throw new DuplicateEntryException(
            'Ingredient with provided data already exists',
          );
        } else if (e.code === 'P2003') {
          throw new ForeignKeyViolationException(entity);
        }
      }
      throw e;
    }
  }

  async delete(id: string): Promise<void> {
    const ingredient = await this.findById(id);
    if (!ingredient) {
      throw new IngredientNotFoundException(id);
    }
    await this.prismaService.ingredient.delete({ where: { id } });
  }

  async findById(id: string): Promise<Ingredient | null> {
    const ingredient = await this.prismaService.ingredient.findUnique({
      where: { id },
      include: { vendor: true, unit: true },
    });
    if (!ingredient) return null;
    return IngredientMapper.toDomain(ingredient);
  }

  async findByIds(ids: string[]): Promise<Ingredient[]> {
    return this.prismaService.ingredient
      .findMany({
        where: { id: { in: ids } },
        include: { vendor: true, unit: true },
      })
      .then((items) => items.map(IngredientMapper.toDomain));
  }

  async getAllPaged(params: IngredientQueryParams): Promise<Page<Ingredient>> {
    const page = params.page ?? defaultPage;
    const pageSize = params.pageSize ?? defaultPageSize;
    const skip = (page - 1) * pageSize;
    const where = this.buildWhereClause(params);
    const orderBy = this.buildOrderByClause(params.orderBy);

    const [items, total] = await Promise.all([
      this.prismaService.ingredient.findMany({
        where,
        skip,
        take: pageSize,
        include: { vendor: true, unit: true },
        orderBy,
      }),
      this.prismaService.ingredient.count({ where }),
    ]);

    return {
      items: items.map(IngredientMapper.toDomain),
      page,
      pageSize,
      total,
      totalPages: Math.ceil(total / pageSize),
    };
  }

  private buildOrderByClause(
    orderBy: IngredientOrderBy | null | undefined,
  ): Prisma.IngredientOrderByWithRelationInput {
    if (!orderBy || orderBy.length === 0) return { created_at: 'desc' };

    const fieldMap: Record<string, string> = {
      minStock: 'min_stock',
      unitCost: 'unit_cost',
      expiredAt: 'expired_at',
      createdAt: 'created_at',
      updatedAt: 'updated_at',
    };

    const result: Prisma.IngredientOrderByWithRelationInput = {};
    for (const { field, direction } of orderBy) {
      const prismaField = fieldMap[field] ?? field;
      (result as Record<string, string>)[prismaField] = direction;
    }
    return result;
  }

  private buildWhereClause(
    params: IngredientQueryParams,
  ): Prisma.IngredientWhereInput {
    const where: Prisma.IngredientWhereInput = {};
    const { filter } = params;

    if (!filter) return where;

    if (filter.vendorId) where.vendor_id = filter.vendorId;
    if (filter.unitId) where.unit_id = filter.unitId;
    if (filter.name)
      where.name = { contains: filter.name, mode: 'insensitive' };

    return where;
  }

  async update(id: string, entity: Partial<Ingredient>): Promise<Ingredient> {
    try {
      const prisma = IngredientMapper.toPrisma(entity as Ingredient);
      return await this.prismaService.ingredient
        .update({
          where: { id },
          data: prisma,
          include: { vendor: true, unit: true },
        })
        .then(IngredientMapper.toDomain);
    } catch (e) {
      if (e instanceof PrismaClientKnownRequestError) {
        if (e.code === 'P2002') {
          throw new DuplicateEntryException(
            'Ingredient with provided data already exists',
          );
        } else if (e.code === 'P2003') {
          throw new ForeignKeyViolationException(entity);
        }
      }
      throw e;
    }
  }
}
