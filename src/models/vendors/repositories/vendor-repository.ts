import { Injectable } from '@nestjs/common';
import { VendorRepository } from './vendor-repository.abstract';
import { Vendor, VendorMapper } from '../entities';
import { PrismaService } from '../../../providers/prisma/prisma.service';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/client';
import {
  DuplicateEntryException,
  ForeignKeyViolationException,
  MissingRequireFieldsException,
} from '../../../common/exceptions';
import { VendorNotFoundException } from '../exceptions';
import { camelCaseToSnakeCase } from '../../../common/utilities/string.util';
import { Page } from '../../../common/interfaces';
import {
  VendorQueryParams,
  VendorQueryFilter,
  VendorOrderBy,
} from '../interfaces';
import { Prisma } from '@prisma/client';
import { paginationConfig } from '../../../common/config';

@Injectable()
export class VendorRepositoryImpl implements VendorRepository {
  private readonly pageDefault = paginationConfig.default.page;
  private readonly pageSizeDefault = paginationConfig.default.pageSize;

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Creates a new vendor in the database.
   *
   * Converts the domain vendor entity to a Prisma-compatible object and attempts to create it in the database.
   * Throws a DuplicateEntryException if a vendor with the same unique data already exists.
   *
   * @param {Vendor} entity - The vendor domain entity to create.
   * @returns {Promise<Vendor>} A promise that resolves to the created vendor domain object.
   * @throws {DuplicateEntryException} If a vendor with the provided data already exists.
   * @throws {ForeignKeyViolationException} If a foreign key constraint is violated.
   * @throws {MissingRequireFieldsException} If required fields are missing from the entity.
   * @throws {Error} For other database or mapping errors.
   */
  async create(entity: Vendor): Promise<Vendor> {
    const { name, ...data } = VendorMapper.toPrisma(entity);
    if (!name) throw new MissingRequireFieldsException(['name']);
    try {
      const record = await this.prisma.vendor.create({
        data: { name, ...data },
      });
      return VendorMapper.toDomain(record);
    } catch (e) {
      if (e instanceof PrismaClientKnownRequestError) {
        if (e.code === 'P2002') {
          throw new DuplicateEntryException(
            'Vendor with provided data already exists',
          );
        } else if (e.code === 'P2003') {
          throw new ForeignKeyViolationException(entity);
        }
      }
      throw e;
    }
  }

  /**
   * Retrieves all non-deleted vendors ordered alphabetically by name.
   *
   * @returns {Promise<Vendor[]>} Array of all vendor domain entities.
   */
  async getAll(): Promise<Vendor[]> {
    const records = await this.prisma.vendor.findMany({
      where: { is_deleted: false },
      orderBy: { name: 'asc' },
    });
    return records.map(VendorMapper.toDomain);
  }

  /**
   * Finds a single non-deleted vendor by its unique identifier.
   *
   * @param {string} id - The UUID of the vendor to find.
   * @returns {Promise<Vendor | null>} The vendor domain entity, or null if not found.
   */
  async findById(id: string): Promise<Vendor | null> {
    const record = await this.prisma.vendor.findFirst({
      where: { id, is_deleted: false },
    });
    return record ? VendorMapper.toDomain(record) : null;
  }

  /**
   * Updates a vendor by its ID.
   *
   * Converts the domain vendor entity to a Prisma-compatible object and attempts to update it in the database.
   * Throws a VendorNotFoundException if the vendor is not found.
   * Throws a DuplicateEntryException if the new name conflicts with an existing vendor.
   *
   * @param {string} id - The UUID of the vendor to update.
   * @param {Partial<Vendor>} entity - The partial vendor data to apply.
   * @returns {Promise<Vendor>} A promise that resolves to the updated vendor domain object.
   * @throws {VendorNotFoundException} If no vendor with the given ID exists.
   * @throws {DuplicateEntryException} If the new name conflicts with an existing vendor.
   */
  async update(id: string, entity: Partial<Vendor>): Promise<Vendor> {
    const existing = await this.findById(id);
    if (!existing) {
      throw new VendorNotFoundException(id);
    }

    try {
      const dataSnakeCase = Object.entries(entity).reduce(
        (acc, [key, value]) => {
          const snakeCase = camelCaseToSnakeCase(key);
          acc[snakeCase] = value;
          return acc;
        },
        {} as Record<string, any>,
      );
      const record = await this.prisma.vendor.update({
        where: { id },
        data: dataSnakeCase,
      });
      return VendorMapper.toDomain(record);
    } catch (e) {
      if (e instanceof PrismaClientKnownRequestError && e.code === 'P2002') {
        throw new DuplicateEntryException(
          'Vendor with provided data already exists',
        );
      }
      throw e;
    }
  }

  /**
   * Soft-deletes a vendor by its ID.
   *
   * Marks the vendor as deleted by setting 'is_deleted' to true and 'deleted_at' to the current date.
   * Throws a VendorNotFoundException if the vendor is not found.
   *
   * @param {string} id - The unique identifier of the vendor to delete.
   * @returns {Promise<void>} A promise that resolves when the vendor is softly deleted.
   * @throws {VendorNotFoundException} If the vendor with the specified ID does not exist.
   */
  async delete(id: string): Promise<void> {
    const existing = await this.findById(id);
    if (!existing) {
      throw new VendorNotFoundException(id);
    }
    await this.prisma.vendor.update({
      where: { id },
      data: { is_deleted: true, deleted_at: new Date() },
    });
  }

  /**
   * Finds multiple vendors by their unique identifiers.
   *
   * @param {string[]} ids - An array of unique identifiers of the vendors to find.
   * @returns {Promise<Vendor[]>} A promise that resolves to an array of found vendors.
   */
  async findByIds(ids: string[]): Promise<Vendor[]> {
    if (!ids.length) return [];

    const records = await this.prisma.vendor.findMany({
      where: {
        id: { in: ids },
        is_deleted: false,
      },
    });
    return records.map(VendorMapper.toDomain);
  }

  /**
   * Retrieves a paginated list of vendors based on query parameters.
   *
   * @param {VendorQueryParams} params - The query parameters for pagination, filtering, and sorting.
   * @returns {Promise<Page<Vendor>>} A promise that resolves to a paginated result containing vendors and pagination info.
   */
  async getAllPaged(params: VendorQueryParams): Promise<Page<Vendor>> {
    const {
      page = this.pageDefault,
      pageSize = this.pageSizeDefault,
      filter,
      orderBy: pairs,
    } = params;

    const where = this.buildWhereClause(filter);
    const orderBy = this.buildOrderByClause(pairs);

    const [items, total] = await Promise.all([
      this.prisma.vendor.findMany({
        where,
        orderBy,
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      this.prisma.vendor.count({ where }),
    ]);

    return {
      items: items.map(VendorMapper.toDomain),
      page,
      pageSize,
      total,
      totalPages: Math.ceil(total / pageSize),
    };
  }

  /**
   * Builds the Prisma orderBy clause from the provided order by pairs.
   *
   * @param {VendorOrderBy} [pairs] - The order by pairs specifying fields and directions.
   * @returns {Prisma.VendorOrderByWithRelationInput | Prisma.VendorOrderByWithRelationInput[]} The Prisma orderBy clause for sorting.
   */
  private buildOrderByClause(
    pairs?: VendorOrderBy,
  ):
    | Prisma.VendorOrderByWithRelationInput
    | Prisma.VendorOrderByWithRelationInput[] {
    if (!pairs || pairs.length === 0) {
      return { created_at: 'desc' };
    }
    return pairs.map((pair) => {
      const snakeField = camelCaseToSnakeCase(pair.field);
      return { [snakeField]: pair.direction };
    });
  }

  /**
   * Builds the Prisma where clause from the provided vendor query filters.
   *
   * @param {VendorQueryFilter} [filters] - The filters to apply to the vendor query.
   * @returns {Prisma.VendorWhereInput} The Prisma where clause for filtering vendors.
   */
  private buildWhereClause(
    filters?: VendorQueryFilter,
  ): Prisma.VendorWhereInput {
    if (!filters) return {};

    const where: Prisma.VendorWhereInput = {};

    if (filters.query) {
      where.OR = [
        { name: { contains: filters.query, mode: 'insensitive' } },
        { contact_name: { contains: filters.query, mode: 'insensitive' } },
        { address: { contains: filters.query, mode: 'insensitive' } },
      ];
    }

    if (filters.status) {
      where.status = filters.status;
    }

    if (filters.isDeleted !== undefined) {
      where.is_deleted = filters.isDeleted;
    }

    if (filters.isSuspended !== undefined) {
      if (filters.isSuspended) {
        where.suspended_at = { not: null };
      } else {
        where.suspended_at = null;
      }
    }

    return where;
  }
}
