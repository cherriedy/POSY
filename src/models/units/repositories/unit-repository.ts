import { Injectable } from '@nestjs/common';
import { UnitRepository } from './unit-repository.abstract';
import { Unit, UnitMapper } from '../entities';
import { PrismaService } from '../../../providers/prisma/prisma.service';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/client';
import { DuplicateEntryException, ForeignKeyViolationException } from '../../../common/exceptions';
import { UnitNotFoundException } from '../exceptions';
import { Page } from '../../../common/interfaces';
import { paginationConfig } from '../../../common/config';
import { UnitOrderBy, UnitQueryFilter, UnitQueryParams } from '../interfaces';
import { Prisma } from '@prisma/client';
import { camelCaseToSnakeCase } from '../../../common/utilities/string.util';

@Injectable()
export class UnitRepositoryImpl implements UnitRepository {
  private readonly pageDefault = paginationConfig.default.page;
  private readonly pageSizeDefault = paginationConfig.default.pageSize;

  constructor(private readonly prisma: PrismaService) { }

  /**
   * Creates a new unit in the database.
   *
   * @param {Unit} entity - The unit domain entity to create.
   * @returns {Promise<Unit>} The created unit.
   * @throws {DuplicateEntryException} If a unit with the same name or abbreviation already exists.
   */
  async create(entity: Unit): Promise<Unit> {
    try {
      const record = await this.prisma.unit.create({
        data: { name: entity.name!, abbreviation: entity.abbreviation! },
      });
      return UnitMapper.toDomain(record);
    } catch (e) {
      if (e instanceof PrismaClientKnownRequestError && e.code === 'P2002') {
        throw new DuplicateEntryException(
          'Unit name or abbreviation already exists',
        );
      }
      throw e;
    }
  }

  /**
   * Finds a single unit by its unique identifier.
   *
   * @param {string} id - The UUID of the unit to find.
   * @returns {Promise<Unit | null>} The unit domain entity, or null if not found.
   */
  async findById(id: string): Promise<Unit | null> {
    const record = await this.prisma.unit.findUnique({ where: { id } });
    return record ? UnitMapper.toDomain(record) : null;
  }

  /**
   * Updates a unit by its ID.
   *
   * @param {string} id - The UUID of the unit to update.
   * @param {Partial<Unit>} entity - The partial unit data to apply.
   * @returns {Promise<Unit>} The updated unit domain entity.
   * @throws {UnitNotFoundException} If no unit with the given ID exists.
   * @throws {DuplicateEntryException} If the new name or abbreviation conflicts with an existing unit.
   */
  async update(id: string, entity: Partial<Unit>): Promise<Unit> {
    try {
      const record = await this.prisma.unit.update({
        where: { id },
        data: {
          name: entity.name,
          abbreviation: entity.abbreviation,
        },
      });
      return UnitMapper.toDomain(record);
    } catch (e) {
      if (e instanceof PrismaClientKnownRequestError && e.code === 'P2002') {
        throw new DuplicateEntryException(
          'Unit name or abbreviation already exists',
        );
      }
      throw e;
    }
  }

  /**
   * Permanently deletes a unit by its ID.
   *
   * @param {string} id - The UUID of the unit to delete.
   * @returns {Promise<void>}
   * @throws {UnitNotFoundException} If no unit with the given ID exists.
   */
  async delete(id: string): Promise<void> {
    try {
      await this.prisma.unit.delete({
        where: { id },
      });
    } catch (e) {
      if (
        e instanceof PrismaClientKnownRequestError &&
        e.code === 'P2003'
      ) {
        throw new ForeignKeyViolationException();
      }

      throw e;
    }
  }

  /**
   * Retrieves a paginated list of units based on query parameters.
   *
   * @param {UnitQueryParams} params - The query parameters for pagination, filtering, and sorting.
   * @returns {Promise<Page<Unit>>} A promise that resolves to a paginated result containing units and pagination info.
   */
  async getAllPaged(params: UnitQueryParams): Promise<Page<Unit>> {
    const {
      page = this.pageDefault,
      pageSize = this.pageSizeDefault,
      filter,
      orderBy: pairs,
    } = params;

    const where = this.buildWhereClause(filter);
    const orderBy = this.buildOrderByClause(pairs);

    const [items, total] = await Promise.all([
      this.prisma.unit.findMany({
        where,
        orderBy,
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      this.prisma.unit.count({ where }),
    ]);

    return {
      items: items.map(UnitMapper.toDomain),
      page,
      pageSize,
      total,
      totalPages: Math.ceil(total / pageSize),
    };
  }

  /**
   * Builds the Prisma orderBy clause from the provided order by pairs.
   *
   * @param {UnitOrderBy} [pairs] - The order by pairs specifying fields and directions.
   * @returns {Prisma.UnitOrderByWithRelationInput | Prisma.UnitOrderByWithRelationInput[]} The Prisma orderBy clause for sorting.
   */
  private buildOrderByClause(
    pairs?: UnitOrderBy,
  ):
    | Prisma.UnitOrderByWithRelationInput
    | Prisma.UnitOrderByWithRelationInput[] {
    if (!pairs || pairs.length === 0) {
      return { created_at: 'desc' };
    }
    return pairs.map((pair) => {
      const snakeKey = camelCaseToSnakeCase(pair.field);
      return { [snakeKey]: pair.direction };
    });
  }

  /**
   * Builds the Prisma where clause from the provided unit query filters.
   *
   * @param {UnitQueryFilter} [filters] - The filters to apply to the unit query.
   * @returns {Prisma.UnitWhereInput} The Prisma where clause for filtering units.
   */
  private buildWhereClause(filters?: UnitQueryFilter): Prisma.UnitWhereInput {
    if (!filters) return {};

    const where: Prisma.UnitWhereInput = {};

    if (filters.query) {
      where.OR = [
        { name: { contains: filters.query, mode: 'insensitive' } },
        { abbreviation: { contains: filters.query, mode: 'insensitive' } },
      ];
    }

    return where;
  }
}
