import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../providers/prisma/prisma.service';
import { EntityTaxConfigRepository } from './entity-tax-config.repository-abstract';
import { EntityTaxConfig, EntityTaxConfigMapper } from '../types';
import { Prisma, TaxConfigEntityType } from '@prisma/client';
import {
  TaxAssociationNotFoundException,
  DuplicateEntityTaxAssociationException,
} from '../exceptions';

/**
 * Repository implementation for entity-tax associations.
 * Supports individual CRUD operations used by best-effort bulk processing in services.
 */
@Injectable()
export class EntityTaxConfigRepositoryImpl implements EntityTaxConfigRepository {
  constructor(private readonly prismaService: PrismaService) {}

  /**
   * Finds an entity-tax association by its unique ID.
   *
   * @param id - The unique ID of the association (UUID).
   * @returns The association domain object if found, otherwise null.
   * @throws {Prisma.PrismaClientKnownRequestError} On database errors.
   */
  async findById(id: string): Promise<EntityTaxConfig | null> {
    const result = await this.prismaService.entityTaxConfig.findUnique({
      where: { id },
      include: { tax: true },
    });

    return result ? EntityTaxConfigMapper.toDomain(result) : null;
  }

  /**
   * Finds all entity associations for a specific tax configuration.
   *
   * @param taxId - The tax configuration ID (UUID).
   * @returns Array of entity-tax associations for the given tax.
   * @throws {Prisma.PrismaClientKnownRequestError} On database errors.
   */
  async findByTaxId(taxId: string): Promise<EntityTaxConfig[]> {
    const results = await this.prismaService.entityTaxConfig.findMany({
      where: { tax_id: taxId },
      include: { tax: true },
      orderBy: { created_at: 'desc' },
    });

    return results.map(EntityTaxConfigMapper.toDomain);
  }

  /**
   * Finds all tax associations for a specific entity.
   *
   * @param entityType - Type of entity (PRODUCT, CATEGORY, ZONE, etc.).
   * @param entityId - Entity ID (UUID).
   * @returns Array of entity-tax associations for the given entity.
   * @throws {Prisma.PrismaClientKnownRequestError} On database errors.
   */
  async findByEntity(
    entityType: string,
    entityId: string,
  ): Promise<EntityTaxConfig[]> {
    const results = await this.prismaService.entityTaxConfig.findMany({
      where: {
        entity_type: entityType as TaxConfigEntityType,
        entity_id: entityId,
      },
      include: { tax: true },
      orderBy: { created_at: 'desc' },
    });

    return results.map(EntityTaxConfigMapper.toDomain);
  }

  /**
   * Creates a new entity-tax association.
   *
   * @param entityTaxConfig - The association to create.
   * @returns The created entity-tax association domain object.
   * @throws {DuplicateEntityTaxAssociationException} If the association already exists.
   * @throws {Prisma.PrismaClientKnownRequestError} On database or validation errors.
   */
  async create(entityTaxConfig: EntityTaxConfig): Promise<EntityTaxConfig> {
    try {
      const prismaData = EntityTaxConfigMapper.toPrisma(entityTaxConfig);

      const result = await this.prismaService.entityTaxConfig.create({
        data: prismaData,
        include: { tax: true },
      });

      return EntityTaxConfigMapper.toDomain(result);
    } catch (e) {
      if (e instanceof Prisma.PrismaClientKnownRequestError) {
        if (e.code === 'P2002') {
          throw new DuplicateEntityTaxAssociationException({
            taxId: entityTaxConfig.taxId,
            entityType: entityTaxConfig.entityType,
            entityId: entityTaxConfig.entityId,
          });
        }
      }
      throw e;
    }
  }

  /**
   * Updates an entity-tax association by its ID.
   *
   * @param id - The association ID (UUID).
   * @param entityTaxConfig - Partial association data to update (isActive, note).
   * @returns The updated entity-tax association domain object.
   * @throws {TaxAssociationNotFoundException} If the association is not found.
   * @throws {Prisma.PrismaClientKnownRequestError} On database or validation errors.
   */
  async update(
    id: string,
    entityTaxConfig: Partial<EntityTaxConfig>,
  ): Promise<EntityTaxConfig> {
    try {
      const updateData: Prisma.EntityTaxConfigUpdateInput = {};

      if (entityTaxConfig.isActive !== undefined) {
        updateData.is_active = entityTaxConfig.isActive;
      }
      if (entityTaxConfig.note !== undefined) {
        updateData.note = entityTaxConfig.note;
      }

      const result = await this.prismaService.entityTaxConfig.update({
        where: { id },
        data: updateData,
        include: { tax: true },
      });

      return EntityTaxConfigMapper.toDomain(result);
    } catch (e) {
      if (e instanceof Prisma.PrismaClientKnownRequestError) {
        if (e.code === 'P2025') {
          throw new TaxAssociationNotFoundException({ id });
        }
      }
      throw e;
    }
  }

  /**
   * Bulk deletes entity-tax associations by their IDs.
   * Used for individual deletions in best-effort mode (typically called with single ID).
   *
   * @param ids - Array of association IDs (UUIDs) to delete.
   * @returns Number of deleted associations.
   * @throws {Prisma.PrismaClientKnownRequestError} On database errors.
   * @note Does not throw if associations don't exist (returns count of actually deleted).
   */
  async bulkDelete(ids: string[]): Promise<number> {
    const result = await this.prismaService.entityTaxConfig.deleteMany({
      where: { id: { in: ids } },
    });

    return result.count;
  }

  /**
   * Bulk checks for duplicate associations.
   *
   * @param taxId - Tax configuration ID (UUID).
   * @param entities - Array of entity specifications, each with:
   *   - entityType: The type of entity
   *   - entityId: The unique entity ID (UUID)
   * @returns Array of existing associations matching the given tax and entities.
   * @throws {Prisma.PrismaClientKnownRequestError} On database errors.
   */
  async bulkCheckDuplicates(
    taxId: string,
    entities: Array<{ entityType: string; entityId: string }>,
  ): Promise<EntityTaxConfig[]> {
    const results = await this.prismaService.entityTaxConfig.findMany({
      where: {
        tax_id: taxId,
        OR: entities.map((entity) => ({
          entity_type: entity.entityType as TaxConfigEntityType,
          entity_id: entity.entityId,
        })),
      },
      include: { tax: true },
    });

    return results.map(EntityTaxConfigMapper.toDomain);
  }
}
