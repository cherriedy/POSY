import { FloorRepository } from './floor.repository-abstract';
import { Floor, FloorMapper } from '../types';
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
import { FloorNotFoundException } from '../exceptions';
import {
  FloorOrderBy,
  FloorQueryFilter,
  FloorQueryParams,
} from '../interfaces';
import { Prisma } from '@prisma/client';

@Injectable()
export class FloorRepositoryImpl implements FloorRepository {
  private readonly pageDefault = paginationConfig.default.page;
  private readonly pageSizeDefault = paginationConfig.default.pageSize;

  constructor(private readonly prismaService: PrismaService) {}

  /**
   * Creates a new floor in the database.
   * @param entity - The floor entity to create.
   * @returns A promise that resolves to the created floor.
   * @throws DuplicateEntryException if a floor with a unique field already exists.
   */
  async create(entity: Floor): Promise<Floor> {
    const prismaFloor = FloorMapper.toPrisma(entity);
    try {
      return await this.prismaService.floor
        .create({ data: prismaFloor })
        .then(FloorMapper.toDomain);
    } catch (e) {
      if (e instanceof PrismaClientKnownRequestError) {
        if (e.code === 'P2002') {
          throw new DuplicateEntryException(
            'Floor with provided unique field already exists',
          );
        }
      }
      throw e;
    }
  }

  /**
   * Deletes a floor by its unique identifier.
   * @param id - The unique identifier of the floor to delete.
   * @returns A promise that resolves when the floor is deleted.
   * @throws FloorNotFoundException if the floor does not exist.
   * @throws ForeignKeyViolationException if the floor is referenced by another record.
   */
  async delete(id: string): Promise<void> {
    try {
      await this.prismaService.floor.delete({ where: { id } });
    } catch (e) {
      if (e instanceof PrismaClientKnownRequestError) {
        if (e.code === 'P2025') {
          throw new FloorNotFoundException(id);
        } else if (e.code === 'P2003') {
          const fields = e.meta?.field_name as string[];
          throw new ForeignKeyViolationException(fields);
        }
      }
      throw e;
    }
  }

  /**
   * Finds a floor by its unique identifier.
   * @param id - The unique identifier of the floor to find.
   * @returns A promise that resolves to the found floor or null if not found.
   */
  async findById(id: string): Promise<Floor | null> {
    const prismaFloor = await this.prismaService.floor.findUnique({
      where: { id },
      include: { tables: true },
    });

    return prismaFloor ? FloorMapper.toDomain(prismaFloor) : null;
  }

  /**
   * Updates an existing floor by its unique identifier.
   * @param id - The unique identifier of the floor to update.
   * @param entity - Partial data to update the floor with.
   * @returns A promise that resolves to the updated floor.
   * @throws FloorNotFoundException if the floor does not exist.
   * @throws DuplicateEntryException if a floor with a unique field already exists.
   */
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
        throw new DuplicateEntryException('Floor name already exists.');
      }
    }

    try {
      return await this.prismaService.floor
        .update({
          where: { id },
          data: dataSnakeCase,
          include: { tables: true },
        })
        ?.then(FloorMapper.toDomain);
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
   * Retrieves a paginated list of floors based on query parameters.
   *
   * @param {FloorQueryParams} params - The query parameters for pagination, filtering, and sorting.
   *   - page: The page number to retrieve (default is from config).
   *   - pageSize: The number of items per page (default is from config).
   *   - filter: Filtering options for floors (see FloorQueryFilter).
   *   - orderBy: Array of sorting options for specific fields and direction.
   * @returns {Promise<Page<Floor>>} A promise that resolves to a paginated result containing floors and pagination info.
   */
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
        include: { tables: true },
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

  /**
   * Builds the Prisma orderBy clause from the provided order by pairs.
   *
   * @param {FloorOrderBy} [pairs] - The order by pairs specifying fields and directions.
   * @returns {Prisma.FloorOrderByWithRelationInput | Prisma.FloorOrderByWithRelationInput[]} The Prisma orderBy clause for sorting.
   */
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

  /**
   * Builds the Prisma where clause from the provided floor query filters.
   *
   * @param {FloorQueryFilter} [filters] - The filters to apply to the floor query.
   * @returns {Prisma.FloorWhereInput} The Prisma where clause for filtering floors.
   */
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
