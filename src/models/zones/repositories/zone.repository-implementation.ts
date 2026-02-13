import { ZoneRepository } from './zone.repository-abstract';
import { Zone, ZoneMapper } from '../types';
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
import { ZoneNotFoundException } from '../exceptions';
import { ZoneOrderBy, ZoneQueryFilter, ZoneQueryParams } from '../interfaces';
import { Prisma } from '@prisma/client';

@Injectable()
export class ZoneRepositoryImpl implements ZoneRepository {
  private readonly pageDefault = paginationConfig.default.page;
  private readonly pageSizeDefault = paginationConfig.default.pageSize;

  constructor(private readonly prismaService: PrismaService) {}

  /**
   * Creates a new zone in the database.
   * @param entity - The zone entity to create.
   * @returns A promise that resolves to the created zone.
   * @throws DuplicateEntryException if a zone with a unique field already exists.
   */
  async create(entity: Zone): Promise<Zone> {
    const prismaZone = ZoneMapper.toPrisma(entity);
    try {
      return await this.prismaService.zone
        .create({ data: prismaZone })
        .then(ZoneMapper.toDomain);
    } catch (e) {
      if (e instanceof PrismaClientKnownRequestError) {
        if (e.code === 'P2002') {
          throw new DuplicateEntryException(
            'Zone with provided unique field already exists',
          );
        }
      }
      throw e;
    }
  }

  /**
   * Deletes a zone by its unique identifier.
   * @param id - The unique identifier of the zone to delete.
   * @returns A promise that resolves when the zone is deleted.
   * @throws ZoneNotFoundException if the zone does not exist.
   * @throws ForeignKeyViolationException if the zone is referenced by another record.
   */
  async delete(id: string): Promise<void> {
    try {
      await this.prismaService.zone.delete({ where: { id } });
    } catch (e) {
      if (e instanceof PrismaClientKnownRequestError) {
        if (e.code === 'P2025') {
          throw new ZoneNotFoundException(id);
        } else if (e.code === 'P2003') {
          const fields = e.meta?.field_name as string[];
          throw new ForeignKeyViolationException(fields);
        }
      }
      throw e;
    }
  }

  /**
   * Finds a zone by its unique identifier.
   * @param id - The unique identifier of the zone to find.
   * @returns A promise that resolves to the found zone or null if not found.
   */
  async findById(id: string): Promise<Zone | null> {
    const prismaZone = await this.prismaService.zone.findUnique({
      where: { id },
      include: { tables: true },
    });

    return prismaZone ? ZoneMapper.toDomain(prismaZone) : null;
  }

  /**
   * Updates an existing zone by its unique identifier.
   * @param id - The unique identifier of the zone to update.
   * @param entity - Partial data to update the zone with.
   * @returns A promise that resolves to the updated zone.
   * @throws ZoneNotFoundException if the zone does not exist.
   * @throws DuplicateEntryException if a zone with a unique field already exists.
   */
  async update(id: string, entity: Partial<Zone>): Promise<Zone> {
    const zone = await this.findById(id);
    if (!zone) throw new ZoneNotFoundException(id);

    const dataSnakeCase = Object.entries(entity).reduce(
      (acc, [key, value]) => {
        const snakeKey = camelCaseToSnakeCase(key);
        acc[snakeKey] = value;
        return acc;
      },
      {} as Record<string, any>,
    );

    if (dataSnakeCase.name && typeof dataSnakeCase.name === 'string') {
      const existing = await this.prismaService.zone.findUnique({
        where: { name: dataSnakeCase.name },
      });
      if (existing && existing.id !== id) {
        throw new DuplicateEntryException('Zone name already exists.');
      }
    }

    try {
      return await this.prismaService.zone
        .update({
          where: { id },
          data: dataSnakeCase,
          include: { tables: true },
        })
        ?.then(ZoneMapper.toDomain);
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
   * Retrieves a paginated list of zones based on query parameters.
   *
   * @param {ZoneQueryParams} params - The query parameters for pagination, filtering, and sorting.
   *   - page: The page number to retrieve (default is from config).
   *   - pageSize: The number of items per page (default is from config).
   *   - filter: Filtering options for zones (see ZoneQueryFilter).
   *   - orderBy: Array of sorting options for specific fields and direction.
   * @returns {Promise<Page<Zone>>} A promise that resolves to a paginated result containing zones and pagination info.
   */
  async getAllPaged(params: ZoneQueryParams): Promise<Page<Zone>> {
    const {
      page = this.pageDefault,
      pageSize = this.pageSizeDefault,
      filter,
      orderBy: pairs,
    } = params;

    const where = this.buildWhereClause(filter);
    const orderBy = this.buildOrderByClause(pairs);

    const [items, total] = await Promise.all([
      this.prismaService.zone.findMany({
        where,
        orderBy,
        skip: (page - 1) * pageSize,
        take: pageSize,
        include: { tables: true },
      }),
      this.prismaService.zone.count({ where }),
    ]);

    return {
      items: items.map((z) => ZoneMapper.toDomain(z)),
      page,
      pageSize,
      total,
      totalPages: Math.ceil(total / pageSize),
    };
  }

  /**
   * Builds the Prisma orderBy clause from the provided order by pairs.
   *
   * @param {ZoneOrderBy} [pairs] - The order by pairs specifying fields and directions.
   * @returns {Prisma.ZoneOrderByWithRelationInput | Prisma.ZoneOrderByWithRelationInput[]} The Prisma orderBy clause for sorting.
   */
  private buildOrderByClause(
    pairs?: ZoneOrderBy,
  ):
    | Prisma.ZoneOrderByWithRelationInput
    | Prisma.ZoneOrderByWithRelationInput[] {
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
   * Builds the Prisma where clause from the provided zone query filters.
   *
   * @param {ZoneQueryFilter} [filters] - The filters to apply to the zone query.
   * @returns {Prisma.ZoneWhereInput} The Prisma where clause for filtering zones.
   */
  private buildWhereClause(filters?: ZoneQueryFilter): Prisma.ZoneWhereInput {
    if (!filters) return {};

    const where: Prisma.ZoneWhereInput = {};

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
