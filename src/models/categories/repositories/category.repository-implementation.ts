import { CategoryRepository } from './category.repository-abstract';
import { Category, CategoryMapper } from '../types';
import { PrismaService } from '../../../providers/prisma/prisma.service';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/client';
import {
  DuplicateEntryException,
  ForeignKeyViolationException,
} from '../../../common/exceptions';
import { paginationConfig } from '../../../common/config';
import { Page } from '../../../common/interfaces';
import { camelCaseToSnakeCase } from '../../../common/utilities/string.util';
import { Injectable } from '@nestjs/common';
import { CategoryNotFoundException } from '../exceptions';
import {
  CategoryOrderBy,
  CategoryQueryFilter,
  CategoryQueryParams,
} from '../interfaces';
import { Prisma } from '@prisma/client';

@Injectable()
export class CategoryRepositoryImpl implements CategoryRepository {
  private readonly pageDefault = paginationConfig.default.page;
  private readonly pageSizeDefault = paginationConfig.default.pageSize;

  constructor(private readonly prismaService: PrismaService) {}

  /**
   * Creates a new category in the database.
   * @param entity - The category entity to create.
   * @returns A promise that resolves to the created category.
   * @throws DuplicateEntryException if a category with a unique field already exists.
   */
  async create(entity: Category): Promise<Category> {
    const prismaCategory = CategoryMapper.toPrisma(entity);
    try {
      return await this.prismaService.category
        .create({ data: prismaCategory })
        .then(CategoryMapper.toDomain);
    } catch (e) {
      if (e instanceof PrismaClientKnownRequestError) {
        if (e.code === 'P2002') {
          throw new DuplicateEntryException(
            'Category with provided unique field already exists',
          );
        }
      }
      throw e;
    }
  }

  /**
   * Deletes a category by its unique identifier.
   * @param id - The unique identifier of the category to delete.
   * @returns A promise that resolves when the category is deleted.
   * @throws CategoryNotFoundException if the category does not exist.
   * @throws ForeignKeyViolationException if the category is referenced by another record.
   */
  async delete(id: string): Promise<void> {
    try {
      await this.prismaService.category.delete({ where: { id } });
    } catch (e) {
      if (e instanceof PrismaClientKnownRequestError) {
        if (e.code === 'P2025') {
          throw new CategoryNotFoundException(id);
        } else if (e.code === 'P2003') {
          const fields = e.meta?.field_name as string[];
          throw new ForeignKeyViolationException(fields);
        }
      }
      throw e;
    }
  }

  /**
   * Finds a category by its unique identifier.
   * @param id - The unique identifier of the category to find.
   * @returns A promise that resolves to the found category or null if not found.
   */
  async findById(id: string): Promise<Category | null> {
    const prismaCategory = await this.prismaService.category.findUnique({
      where: { id },
    });

    return prismaCategory ? CategoryMapper.toDomain(prismaCategory) : null;
  }

  /**
   * Updates an existing category by its unique identifier.
   * @param id - The unique identifier of the category to update.
   * @param entity - Partial data to update the category with.
   * @returns A promise that resolves to the updated category.
   * @throws CategoryNotFoundException if the category does not exist.
   * @throws DuplicateEntryException if a category with a unique field already exists.
   */
  async update(id: string, entity: Partial<Category>): Promise<Category> {
    const category = await this.findById(id);
    if (!category) throw new CategoryNotFoundException(id);

    const dataSnakeCase = Object.entries(entity).reduce(
      (acc, [key, value]) => {
        const snakeKey = camelCaseToSnakeCase(key);
        acc[snakeKey] = value;
        return acc;
      },
      {} as Record<string, any>,
    );

    if (dataSnakeCase.slug && typeof dataSnakeCase.slug === 'string') {
      const existing = await this.prismaService.category.findUnique({
        where: { slug: dataSnakeCase.slug },
      });
      if (existing && existing.id !== id) {
        throw new DuplicateEntryException('Slug already exists.');
      }
    }
    try {
      return await this.prismaService.category
        .update({
          where: { id },
          data: dataSnakeCase,
        })
        ?.then(CategoryMapper.toDomain);
    } catch (e) {
      if (e instanceof PrismaClientKnownRequestError) {
        if (e.code === 'P2002') {
          throw new DuplicateEntryException(e.message);
        }
      }
      throw e;
    }
  }

  /**
   * Retrieves a paginated list of categories based on query parameters.
   *
   * @param {CategoryQueryParams} params - The query parameters for pagination, filtering, and sorting.
   *   - page: The page number to retrieve (default is from config).
   *   - pageSize: The number of items per page (default is from config).
   *   - filter: Filtering options for categories (see CategoryQueryFilter).
   *   - orderBy: Array of sorting options for specific fields and direction.
   * @returns {Promise<Page<Category>>} A promise that resolves to a paginated result containing categories and pagination info.
   */
  async getAllPaged(params: CategoryQueryParams): Promise<Page<Category>> {
    const {
      page = this.pageDefault,
      pageSize = this.pageSizeDefault,
      filter,
      orderBy: pairs,
    } = params;

    const where = this.buildWhereClause(filter);
    const orderBy = this.buildOrderByClause(pairs);

    const [items, total] = await Promise.all([
      this.prismaService.category.findMany({
        where,
        orderBy,
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      this.prismaService.category.count({ where }),
    ]);

    return {
      items: items.map((c) => CategoryMapper.toDomain(c)),
      page,
      pageSize,
      total,
      totalPages: Math.ceil(total / pageSize),
    };
  }

  /**
   * Builds the Prisma orderBy clause from the provided order by pairs.
   *
   * @param {CategoryOrderBy} [pairs] - The order by pairs specifying fields and directions.
   * @returns {Prisma.CategoryOrderByWithRelationInput | Prisma.CategoryOrderByWithRelationInput[]} The Prisma orderBy clause for sorting.
   */
  private buildOrderByClause(
    pairs?: CategoryOrderBy,
  ):
    | Prisma.CategoryOrderByWithRelationInput
    | Prisma.CategoryOrderByWithRelationInput[] {
    if (!pairs || pairs.length === 0) {
      return { created_at: 'desc' };
    }

    const mapping: Record<string, string> = {
      name: 'name',
      createdAt: 'created_at',
      updatedAt: 'updated_at',
    };

    return pairs.map((pair) => {
      const snakeField = mapping[pair.field] || pair.field;
      return { [snakeField]: pair.direction };
    });
  }

  /**
   * Builds the Prisma where clause from the provided category query filters.
   *
   * @param {CategoryQueryFilter} [filters] - The filters to apply to the category query.
   * @returns {Prisma.CategoryWhereInput} The Prisma where clause for filtering categories.
   */
  private buildWhereClause(
    filters?: CategoryQueryFilter,
  ): Prisma.CategoryWhereInput {
    if (!filters) return {};

    const where: Prisma.CategoryWhereInput = {};

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
