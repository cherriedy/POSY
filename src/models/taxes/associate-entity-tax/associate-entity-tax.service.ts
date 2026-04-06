import { Inject, Injectable } from '@nestjs/common';
import { EntityTaxConfigRepository } from '../repositories';
import { TaxRepository } from '../repositories';
import { EntityTaxConfig } from '../entities';
import {
  TaxNotFoundException,
  InvalidTaxEntityCombinationException,
} from '../exceptions';
import { EntityType, TaxType } from '../enums';
import { ZoneRepository } from '../../zones/repositories';
import { ProductRepository } from 'src/models/products/repositories/product-repository.abstract';
import { CategoryRepository } from '../../categories';
import { ZoneNotFoundException } from '../../zones/exceptions';
import { ProductNotFoundException } from '../../products';
import { CategoryNotFoundException } from '../../categories';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import {
  TaxAssociationBulkUpsertPayload,
  TaxAssociationBulkUpsertResultItem,
} from './associate-entity-tax.interface';

@Injectable()
export class AssociateEntityTaxService {
  @Inject(WINSTON_MODULE_PROVIDER)
  private readonly logger: import('winston').Logger;

  constructor(
    private readonly entityTaxConfigRepository: EntityTaxConfigRepository,
    private readonly taxRepository: TaxRepository,
    private readonly zoneRepository: ZoneRepository,
    private readonly productRepository: ProductRepository,
    private readonly categoryRepository: CategoryRepository,
  ) {}

  /**
   * Upserts associations between a tax configuration and one or more entities.
   * Uses the Per-Item Result pattern: each entity is processed independently,
   * and the result includes both successful and failed operations.
   *
   * If an association already exists for a given entity it will be updated (isActive, note);
   * otherwise a new association is created.
   *
   * @param payload - The bulk upsert payload containing the tax ID and an array of entities to associate.
   * @returns Promise resolving to an array of per-item results with status SUCCEED or FAILED.
   *
   * @throws TaxNotFoundException If the specified tax does not exist (fails entire operation).
   */
  async bulkUpsert(
    payload: TaxAssociationBulkUpsertPayload,
  ): Promise<TaxAssociationBulkUpsertResultItem[]> {
    const { taxId, items: entities } = payload;
    const tax = await this.taxRepository.findById(taxId);
    if (!tax) throw new TaxNotFoundException({ id: taxId });

    const results: TaxAssociationBulkUpsertResultItem[] = [];

    for (const entity of entities) {
      const { id: entityId, type: entityType } = entity.entityRef;

      try {
        // Validate entity existence and tax-entity association rules
        await this.ensureEntityExists(entityType, entityId);
        this.assertTaxEntityAssociationAllowed(tax.type, entityType);

        // Check if association already exists
        const association = await this.entityTaxConfigRepository.checkDuplicate(
          taxId,
          entity.entityRef,
        );

        let result: EntityTaxConfig;
        if (association) {
          // Update an existing association
          const associationId = association.id!;
          result = await this.entityTaxConfigRepository.update!(associationId, {
            isActive: entity.isActive ?? association.isActive,
            note: entity.note ?? association.note,
          });
        } else {
          // Create a new association
          const association = new EntityTaxConfig(
            undefined,
            taxId,
            entityId,
            entityType,
            entity.isActive,
            entity.note,
          );
          result = await this.entityTaxConfigRepository.create!(association);
        }

        results.push({
          entityRef: entity.entityRef,
          status: 'SUCCEED',
          config: result,
        });
      } catch (e) {
        let errorMessage = 'Unknown error occurred';

        if (e instanceof ZoneNotFoundException) {
          errorMessage = `Zone with ID ${entity.entityRef?.id} not found`;
        } else if (e instanceof ProductNotFoundException) {
          errorMessage = `Product with ID ${entity.entityRef?.id} not found`;
        } else if (e instanceof CategoryNotFoundException) {
          errorMessage = `Category with ID ${entity.entityRef?.id} not found`;
        } else if (e instanceof InvalidTaxEntityCombinationException) {
          errorMessage = `Invalid combination: ${tax.type} cannot be associated with ${entity.entityRef?.type}`;
        } else if (e instanceof Error) {
          this.logger.error(e.message);
        }

        results.push({
          entityRef: entity.entityRef,
          status: 'FAILED',
          error: errorMessage,
        });
      }
    }

    return results;
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
  private assertTaxEntityAssociationAllowed(
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
