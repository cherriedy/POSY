import { TaxRepository } from './tax.repository-abstract';
import { TaxConfig, TaxConfigMapper } from '../types';
import { Prisma } from '@prisma/client';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/client';
import { DuplicateEntryException } from '../../../common/exceptions';
import { Injectable } from '@nestjs/common';
import { TaxNotFoundException } from '../exceptions';
import { TaxOrderBy, TaxQueryFilters, TaxQueryParams } from '../interfaces';
import { camelCaseToSnakeCase } from '../../../common/utilities/string.util';
import { paginationConfig } from '../../../common/config';
import { PrismaService } from '../../../providers/prisma/prisma.service';
import { Page } from '../../../common/interfaces';

const { page: defaultPage, pageSize: defaultPageSize } =
  paginationConfig.default;

@Injectable()
export class TaxRepositoryImpl implements TaxRepository {
  /**
   * Constructs a new TaxRepositoryImpl instance.
   * @param prismaService - The PrismaService instance for database operations.
   */
  constructor(private readonly prismaService: PrismaService) {}

  /**
   * Creates a new tax configuration in the database.
   *
   * @param tax - The tax configuration domain object to create.
   * @returns The created tax configuration domain object.
   * @throws {DuplicateEntryException} If a tax with a unique field already exists.
   * @throws {PrismaClientKnownRequestError} For other Prisma errors.
   */
  async create(tax: TaxConfig): Promise<TaxConfig> {
    const prismaTax = TaxConfigMapper.toPrisma(tax);
    try {
      return await this.prismaService.taxConfig
        .create({
          data: prismaTax,
        })
        .then(TaxConfigMapper.toDomain);
    } catch (e) {
      if (e instanceof PrismaClientKnownRequestError) {
        if (e.code === 'P2002') {
          throw new DuplicateEntryException(
            'Tax configuration with provided unique field already exists',
          );
        }
      }
      throw e;
    }
  }

  /**
   * Soft deletes a tax configuration by setting is_deleted to true and updating deleted_at.
   *
   * @param id - The ID of the tax configuration to delete.
   * @throws {TaxNotFoundException} If the tax configuration does not exist.
   */
  async delete(id: string): Promise<void> {
    const existingTax = await this.findById(id);
    if (!existingTax) {
      throw new TaxNotFoundException({ id });
    }

    await this.prismaService.taxConfig.update({
      where: { id },
      data: {
        is_deleted: true,
        deleted_at: new Date(),
      },
    });
  }

  /**
   * Finds a tax configuration by its unique ID.
   *
   * @param id - The unique ID of the tax configuration.
   * @returns The tax configuration domain object if found, otherwise null.
   */
  async findById(id: string): Promise<TaxConfig | null> {
    return await this.prismaService.taxConfig
      .findUnique({
        where: { id },
      })
      ?.then(TaxConfigMapper.toDomain);
  }

  /**
   * Retrieves a paginated list of tax configurations, optionally filtered by query parameters.
   *
   * @param params - Pagination and filter parameters.
   * @returns A paginated list of tax configuration domain objects.
   */
  async getAllPaged(params: TaxQueryParams = {}): Promise<Page<TaxConfig>> {
    const {
      page = defaultPage,
      pageSize = defaultPageSize,
      filter,
      orderBy: pairs,
    } = params;
    const where = this.buildWhereClause(filter);
    const orderBy = this.buildOrderByClause(pairs);
    const [items, total] = await Promise.all([
      this.prismaService.taxConfig.findMany({
        where,
        orderBy,
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      this.prismaService.taxConfig.count({ where }),
    ]);
    return {
      items: items.map(TaxConfigMapper.toDomain),
      page,
      pageSize,
      total,
      totalPages: Math.ceil(total / pageSize),
    };
  }

  /**
   * Updates a tax configuration by its ID with the provided partial tax data.
   *
   * @param id - The ID of the tax configuration to update.
   * @param tax - Partial tax configuration data to update.
   * @returns The updated tax configuration domain object.
   * @throws {TaxNotFoundException} If the tax configuration does not exist.
   * @throws {DuplicateEntryException} If a tax with a unique field already exists.
   * @throws {PrismaClientKnownRequestError} For other Prisma errors.
   */
  async update(id: string, tax: Partial<TaxConfig>): Promise<TaxConfig> {
    try {
      const taxWithoutId = { ...tax };
      delete taxWithoutId.id;

      const dataSnakeCase = Object.entries(taxWithoutId).reduce(
        (acc, [key, value]) => {
          const snakeKey = camelCaseToSnakeCase(key);
          acc[snakeKey] = value;
          return acc;
        },
        {} as Record<string, any>,
      );

      return await this.prismaService.taxConfig
        .update({
          where: { id },
          data: dataSnakeCase,
        })
        .then(TaxConfigMapper.toDomain);
    } catch (e) {
      if (e instanceof PrismaClientKnownRequestError) {
        if (e.code === 'P2025') {
          throw new TaxNotFoundException({ id });
        } else if (e.code === 'P2002') {
          throw new DuplicateEntryException(
            'Tax configuration with provided unique field already exists',
          );
        }
      }
      throw e;
    }
  }

  /**
   * Retrieves all active tax configurations, ordered by sort order ascending.
   *
   * @returns Array of active tax configuration domain objects.
   */
  async getActiveTaxes(): Promise<TaxConfig[]> {
    return await this.prismaService.taxConfig
      .findMany({
        where: { is_active: true },
        orderBy: { sort_order: 'asc' },
      })
      .then((taxes) => taxes.map(TaxConfigMapper.toDomain));
  }

  /**
   * Builds a Prisma where clause object from the provided tax query filters.
   *
   * @param filters - The filters to apply to the query.
   * @returns A Prisma.TaxConfigWhereInput object for filtering tax configurations.
   */
  private buildWhereClause(
    filters?: TaxQueryFilters,
  ): Prisma.TaxConfigWhereInput {
    if (!filters) return {};

    const where: Prisma.TaxConfigWhereInput = {};

    if (filters.type) {
      where.type = { in: filters.type };
    }
    if (filters.rateType) {
      where.rate_type = { in: filters.rateType };
    }
    if (filters.isActive !== undefined) {
      where.is_active = filters.isActive;
    }
    if (filters.isIncluded !== undefined) {
      where.is_included = filters.isIncluded;
    }
    if (filters.applyAfterVAT !== undefined) {
      where.apply_after_vat = filters.applyAfterVAT;
    }
    if (filters.isDeleted !== undefined) {
      where.is_deleted = filters.isDeleted;
    }
    // Blind search support
    if (filters.query) {
      where.OR = [
        { name: { contains: filters.query, mode: 'insensitive' } },
        { display_name: { contains: filters.query, mode: 'insensitive' } },
        { description: { contains: filters.query, mode: 'insensitive' } },
      ];
    }
    return where;
  }

  /**
   * Builds a Prisma orderBy clause from the provided order by pairs.
   *
   * @param pairs - Array of order by field/direction pairs.
   * @returns A Prisma.TaxConfigOrderByWithRelationInput or array for ordering tax configurations.
   */
  private buildOrderByClause(
    pairs?: TaxOrderBy,
  ):
    | Prisma.TaxConfigOrderByWithRelationInput
    | Prisma.TaxConfigOrderByWithRelationInput[] {
    if (!pairs || pairs.length === 0) {
      return { sort_order: 'asc' };
    }
    return pairs.map((pair) => {
      const snakeField = camelCaseToSnakeCase(pair.field);
      return { [snakeField]: pair.direction };
    });
  }
}
