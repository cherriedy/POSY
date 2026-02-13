import { Injectable } from '@nestjs/common';
import { EntityTaxConfigRepository } from '../repositories';
import { TaxRepository } from '../repositories';
import { EntityTaxConfig } from '../types';
import {
  TaxNotFoundException,
  DuplicateEntityTaxAssociationException,
  InvalidTaxEntityCombinationException,
} from '../exceptions';
import { EntityType, TaxType } from '../enums';
import { ZoneRepository } from '../../zones/repositories';
import { ProductRepository } from '../../products/repositories';
import { CategoryRepository } from '../../categories/repositories';
import { ZoneNotFoundException } from '../../zones/exceptions';
import { ProductNotFoundException } from '../../products/exceptions';
import { CategoryNotFoundException } from '../../categories/exceptions';
import { TaxAssociationCreateItem } from '../interfaces';

@Injectable()
export class AssociateEntityTaxService {
  constructor(
    private readonly entityTaxConfigRepository: EntityTaxConfigRepository,
    private readonly taxRepository: TaxRepository,
    private readonly zoneRepository: ZoneRepository,
    private readonly productRepository: ProductRepository,
    private readonly categoryRepository: CategoryRepository,
  ) {}

  /**
   * Associates a tax configuration with one or more entities, after performing all necessary validations.
   * Uses a best-effort approach: each entity is processed individually, and the result includes both successes and failures.
   *
   * @param taxId - Unique identifier of the tax configuration to associate.
   * @param entities - Array of entities to associate (1-100). Each entity includes type, id, isActive, and optional note.
   * @returns Promise resolving to an object with arrays of successful associations and failed items.
   *
   * @throws TaxNotFoundException If the specified tax does not exist (fails entire operation).
   *
   * @example
   * const result = await associateEntityTaxService.associateBulk('tax-uuid', [
   *   { entityType: EntityType.PRODUCT, entityId: 'prod-uuid', isActive: true },
   *   { entityType: EntityType.ZONE, entityId: 'zone-uuid', note: 'Special case' }
   * ]);
   * // result.successes: [EntityTaxConfig, ...]
   * // result.failures: [{ id, type, error }, ...]
   */
  async associateBulk(
    taxId: string,
    entities: Array<TaxAssociationCreateItem>,
  ): Promise<{
    successes: EntityTaxConfig[];
    failures: Array<{ id: string; type: string; error: string }>;
  }> {
    // Validate tax exists (if tax doesn't exist, fail the entire operation)
    const tax = await this.taxRepository.findById(taxId);
    if (!tax) {
      throw new TaxNotFoundException({ id: taxId });
    }

    const successes: EntityTaxConfig[] = [];
    const failures: Array<{ id: string; type: string; error: string }> = [];

    // Process each entity individually (best-effort)
    for (const entity of entities) {
      try {
        // Validate entity exists
        await this.ensureEntityExists(entity.entityType, entity.entityId);

        // Check for duplicate
        const existing =
          await this.entityTaxConfigRepository.bulkCheckDuplicates(taxId, [
            { entityType: entity.entityType, entityId: entity.entityId },
          ]);
        if (existing.length > 0) {
          failures.push({
            id: entity.entityId,
            type: entity.entityType,
            error: `Association already exists for ${entity.entityType} with ID ${entity.entityId}`,
          });
          continue;
        }

        // Validate tax-entity combination
        this.validateTaxEntityCombination(tax.type, entity.entityType);

        // Create association with individual isActive and note values
        const association = new EntityTaxConfig(
          null,
          taxId,
          entity.entityId,
          entity.entityType,
          entity.isActive ?? true, // Use entity-specific value or default to true
          entity.note ?? null, // Use entity-specific value or null
          null,
          null,
          null,
        );

        const created =
          await this.entityTaxConfigRepository.create!(association);
        successes.push(created);
      } catch (e) {
        // Capture individual failures
        let errorMessage = 'Unknown error occurred';

        if (e instanceof ZoneNotFoundException) {
          errorMessage = `Zone with ID ${entity.entityId} not found`;
        } else if (e instanceof ProductNotFoundException) {
          errorMessage = `Product with ID ${entity.entityId} not found`;
        } else if (e instanceof CategoryNotFoundException) {
          errorMessage = `Category with ID ${entity.entityId} not found`;
        } else if (e instanceof InvalidTaxEntityCombinationException) {
          errorMessage = `Invalid combination: ${tax.type} cannot be associated with ${entity.entityType}`;
        } else if (e instanceof DuplicateEntityTaxAssociationException) {
          errorMessage = `Association already exists for ${entity.entityType} with ID ${entity.entityId}`;
        } else if (e instanceof Error) {
          errorMessage = e.message;
        }

        failures.push({
          id: entity.entityId,
          type: entity.entityType,
          error: errorMessage,
        });
      }
    }

    return { successes, failures };
  }

  /**
   * Validates whether a given tax type can be associated with a specific entity type.
   *
   * Business rules:
   * - VAT taxes are global and cannot be associated with specific entities.
   * - Service Charge taxes can only be associated with ZONE entities.
   *
   * @param taxType - The type of tax being associated.
   * @param entityType - The type of entity being associated.
   * @throws InvalidTaxEntityCombinationException If the tax-entity combination is not allowed by business rules.
   */
  private validateTaxEntityCombination(
    taxType: TaxType,
    entityType: EntityType,
  ): void {
    // VAT should not be associated with specific entities
    if (taxType === TaxType.VAT) {
      throw new InvalidTaxEntityCombinationException({
        taxType,
        entityType,
      });
    }

    // Service Charge can only be associated with Zones
    if (taxType === TaxType.SERVICE_CHARGE && entityType !== EntityType.ZONE) {
      throw new InvalidTaxEntityCombinationException({
        taxType,
        entityType,
      });
    }
  }

  /**
   * Ensures the existence of an entity for the given type and ID.
   *
   * Checks if the entity specified by the provided entityType and entityId exists
   * in the corresponding repository. Throws the appropriate exception if not found.
   *
   * @param entityType - The type of entity to check (ZONE, PRODUCT, CATEGORY).
   * @param entityId - The unique identifier of the entity to check.
   * @returns Promise<void> Resolves if the entity exists; otherwise, throws the relevant not-found exception.
   *
   * @throws ZoneNotFoundException If the entityType is ZONE and the zone does not exist.
   * @throws ProductNotFoundException If the entityType is PRODUCT and the product does not exist.
   * @throws CategoryNotFoundException If the entityType is CATEGORY and the category does not exist.
   */
  private async ensureEntityExists(
    entityType: EntityType,
    entityId: string,
  ): Promise<void> {
    switch (entityType) {
      case EntityType.ZONE: {
        const zone = await this.zoneRepository.findById(entityId);
        if (!zone) throw new ZoneNotFoundException(entityId);
        break;
      }
      case EntityType.PRODUCT: {
        const product = await this.productRepository.findById(entityId);
        if (!product) throw new ProductNotFoundException(entityId);
        break;
      }
      case EntityType.CATEGORY: {
        const category = await this.categoryRepository.findById(entityId);
        if (!category) throw new CategoryNotFoundException(entityId);
        break;
      }
    }
  }
}
