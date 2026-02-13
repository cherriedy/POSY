import { TableRepository } from './table.repository-abstract';
import { Table, TableMapper } from '../types';
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
import { TableNotFoundException } from '../exceptions';
import {
  TableOrderBy,
  TableQueryFilter,
  TableQueryParams,
} from '../interfaces';
import { Prisma } from '@prisma/client';

@Injectable()
export class TableRepositoryImpl implements TableRepository {
  private readonly pageDefault = paginationConfig.default.page;
  private readonly pageSizeDefault = paginationConfig.default.pageSize;

  constructor(private readonly prismaService: PrismaService) {}

  /**
   * Creates a new table in the database.
   * @param entity - The table entity to create.
   * @returns A promise that resolves to the created table.
   * @throws DuplicateEntryException if a table with a unique field already exists.
   */
  async create(entity: Table): Promise<Table> {
    const prismaTable = TableMapper.toPrisma(entity);
    try {
      return await this.prismaService.table
        .create({
          data: prismaTable,
          include: { floor: true, zone: true },
        })
        .then(TableMapper.toDomain);
    } catch (e) {
      if (e instanceof PrismaClientKnownRequestError) {
        if (e.code === 'P2002') {
          throw new DuplicateEntryException(
            'Table with provided unique field already exists',
          );
        }
      }
      throw e;
    }
  }

  /**
   * Deletes a table by its unique identifier.
   * @param id - The unique identifier of the table to delete.
   * @returns A promise that resolves when the table is deleted.
   * @throws TableNotFoundException if the table does not exist.
   * @throws ForeignKeyViolationException if the table is referenced by another record.
   */
  async delete(id: string): Promise<void> {
    try {
      await this.prismaService.table.delete({ where: { id } });
    } catch (e) {
      if (e instanceof PrismaClientKnownRequestError) {
        if (e.code === 'P2025') {
          throw new TableNotFoundException(id);
        } else if (e.code === 'P2003') {
          const fields = e.meta?.field_name as string[];
          throw new ForeignKeyViolationException(fields);
        }
      }
      throw e;
    }
  }

  /**
   * Finds a table by its unique identifier.
   * @param id - The unique identifier of the table to find.
   * @returns A promise that resolves to the found table or null if not found.
   */
  async findById(id: string): Promise<Table | null> {
    const prismaTable = await this.prismaService.table.findUnique({
      where: { id },
      include: { floor: true, zone: true },
    });

    return prismaTable ? TableMapper.toDomain(prismaTable) : null;
  }

  /**
   * Updates an existing table by its unique identifier.
   * @param id - The unique identifier of the table to update.
   * @param entity - Partial data to update the table with.
   * @returns A promise that resolves to the updated table.
   * @throws TableNotFoundException if the table does not exist.
   * @throws DuplicateEntryException if a table with a unique field already exists.
   */
  async update(id: string, entity: Partial<Table>): Promise<Table> {
    const table = await this.findById(id);
    if (!table) throw new TableNotFoundException(id);

    const dataSnakeCase = Object.entries(entity).reduce(
      (acc, [key, value]) => {
        const snakeKey = camelCaseToSnakeCase(key);
        acc[snakeKey] = value;
        return acc;
      },
      {} as Record<string, any>,
    );

    // Check for duplicate name within same floor
    if (dataSnakeCase.name && typeof dataSnakeCase.name === 'string') {
      const floorId = dataSnakeCase.floor_id ?? table.floorId;
      if (floorId) {
        const existing = await this.prismaService.table.findFirst({
          where: {
            name: dataSnakeCase.name,
            floor_id: floorId,
          },
        });
        if (existing && existing.id !== id) {
          throw new DuplicateEntryException(
            'Table name already exists on this floor.',
          );
        }
      }
    }

    try {
      return await this.prismaService.table
        .update({
          where: { id },
          data: dataSnakeCase,
          include: { floor: true, zone: true },
        })
        ?.then(TableMapper.toDomain);
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
   * Retrieves a paginated list of tables based on query parameters.
   *
   * @param {TableQueryParams} params - The query parameters for pagination, filtering, and sorting.
   *   - page: The page number to retrieve (default is from config).
   *   - pageSize: The number of items per page (default is from config).
   *   - filter: Filtering options for tables (see TableQueryFilter).
   *   - orderBy: Array of sorting options for specific fields and direction.
   * @returns {Promise<Page<Table>>} A promise that resolves to a paginated result containing tables and pagination info.
   */
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
        include: { floor: true, zone: true },
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

  /**
   * Builds the Prisma orderBy clause from the provided order by pairs.
   *
   * @param {TableOrderBy} [pairs] - The order by pairs specifying fields and directions.
   * @returns {Prisma.TableOrderByWithRelationInput | Prisma.TableOrderByWithRelationInput[]} The Prisma orderBy clause for sorting.
   */
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

  /**
   * Builds the Prisma where clause from the provided table query filters.
   *
   * @param {TableQueryFilter} [filters] - The filters to apply to the table query.
   * @returns {Prisma.TableWhereInput} The Prisma where clause for filtering tables.
   */
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

    if (filters.floorId) {
      where.floor_id = filters.floorId;
    }

    if (filters.zoneId) {
      where.zone_id = filters.zoneId;
    }

    return where;
  }
}
