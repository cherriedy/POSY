import { BaseRepository } from '../../../common/interfaces';
import { EntityTaxConfig } from '../types';

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
   * Delete entity-tax associations by their IDs.
   * Used for best-effort bulk delete operations (called individually per ID).
   *
   * @param ids - Array of association IDs (UUIDs) to delete.
   * @returns Number of deleted associations.
   * @throws May throw on database errors.
   * @note This is used by services for individual deletions in best-effort mode.
   */
  abstract bulkDelete(ids: string[]): Promise<number>;

  /**
   * Bulk check for duplicate entity-tax associations.
   *
   * @param taxId - The tax configuration ID (UUID).
   * @param entities - Array of entity specifications, each with:
   *   - entityType: The type of entity
   *   - entityId: The unique entity ID (UUID)
   * @returns Array of existing associations matching the given tax and entities.
   * @throws May throw on database errors.
   */
  abstract bulkCheckDuplicates(
    taxId: string,
    entities: Array<{ entityType: string; entityId: string }>,
  ): Promise<EntityTaxConfig[]>;
}
