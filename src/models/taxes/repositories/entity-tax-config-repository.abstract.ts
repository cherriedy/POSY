import { BaseRepository } from '../../../common/interfaces';
import { EntityTaxConfig } from '../entities';
import { TaxableEntityReference } from '../interfaces';

/**
 * Abstract repository for managing entity-tax associations.
 * Provides CRUD and bulk operations for tax-entity configuration records.
 * Bulk operations support best-effort processing at the service layer.
 */
export abstract class EntityTaxConfigRepository extends BaseRepository<EntityTaxConfig> {
  /**
   * Find an entity-tax association by its unique identifier.
   *
   * @param id - The unique association ID (UUID).
   * @returns The entity-tax association if found, otherwise null.
   * @throws May throw on database errors.
   */
  abstract findById(id: string): Promise<EntityTaxConfig | null>;

  /**
   * Find all entity-tax associations for a specific tax configuration.
   *
   * @param taxId - The tax configuration ID (UUID).
   * @returns Array of entity-tax associations for the given tax.
   * @throws May throw on database errors.
   */
  abstract findByTaxId(taxId: string): Promise<EntityTaxConfig[]>;

  /**
   * Find all tax associations for a specific entity.
   *
   * @param entityType - The type of entity (e.g., PRODUCT, CATEGORY, ZONE).
   * @param entityId - The unique entity ID (UUID).
   * @returns Array of entity-tax associations for the given entity.
   * @throws May throw on database errors.
   */
  abstract findByEntity(
    entityType: string,
    entityId: string,
  ): Promise<EntityTaxConfig[]>;

  /**
   * Delete a single entity-tax association by its ID.
   *
   * @param id - The association ID (UUID) to delete.
   * @param entityRef - Optional reference to the taxable entity.
   * @throws {TaxAssociationNotFoundException} If the association does not exist.
   * @throws May throw on database errors.
   */
  abstract delete(
    id: string,
    entityRef?: TaxableEntityReference,
  ): Promise<void>;

  /**
   * Check for an existing entity-tax association with the same tax ID and entity reference.
   *
   * Used to prevent duplicate associations when creating or updating records.
   *
   * @param taxId - The tax configuration ID (UUID) to check for.
   * @param entityRef - The reference to the taxable entity to check for.
   *
   * @returns The existing association if found, otherwise null.
   * @throws May throw on database errors.
   */
  abstract checkDuplicate(
    taxId: string,
    entityRef: TaxableEntityReference,
  ): Promise<EntityTaxConfig | null>;
}
