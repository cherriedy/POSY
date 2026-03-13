import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../providers/prisma/prisma.service';
import { EntityTaxConfigRepository } from './entity-tax-config-repository.abstract';
import { EntityTaxConfig, EntityTaxConfigMapper } from '../entities';
import { Prisma, TaxConfigEntityType } from '@prisma/client';
import {
  DuplicateEntityTaxAssociationException,
  TaxAssociationNotFoundException,
} from '../exceptions';
import { TaxableEntityReference } from '../interfaces';

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
   * Deletes a single entity-tax association by its ID.
   *
   * @param id - The association ID (UUID) to delete.
   * @param entityRef - Optional reference to the taxable entity.
   * @returns void
   * @throws {TaxAssociationNotFoundException} If the association does not exist.
   * @throws {Prisma.PrismaClientKnownRequestError} On database errors.
   */
  async delete(id: string, entityRef?: TaxableEntityReference): Promise<void> {
    try {
      const whereClause: Prisma.EntityTaxConfigWhereUniqueInput = { id };

      if (entityRef) {
        Object.assign(whereClause, {
          entity_id: entityRef.id,
          entity_type: entityRef.type as TaxConfigEntityType,
        });
      }

      await this.prismaService.entityTaxConfig.delete({
        where: whereClause,
      });
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
   * Checks for an existing entity-tax association for a given tax and entity reference.
   *
   * @param taxId - The tax configuration ID (UUID) to check against.
   * @param entityRef - The reference to the taxable entity to check for an existing association.
   * @returns The existing association if found, otherwise null.
   * @throws {Prisma.PrismaClientKnownRequestError} On database errors.
   */
  async checkDuplicate(
    taxId: string,
    entityRef: TaxableEntityReference,
  ): Promise<EntityTaxConfig | null> {
    const existing = await this.prismaService.entityTaxConfig.findFirst({
      where: {
        tax_id: taxId,
        entity_type: entityRef.type as TaxConfigEntityType,
        entity_id: entityRef.id,
      },
    });
    return existing ? EntityTaxConfigMapper.toDomain(existing) : null;
  }
}
