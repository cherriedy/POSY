import { Injectable } from '@nestjs/common';
import { EntityTaxConfigRepository } from '../repositories';
import { EntityTaxConfig } from '../entities';

@Injectable()
export class GetEntityTaxAssociationsService {
  constructor(
    private readonly entityTaxConfigRepository: EntityTaxConfigRepository,
  ) {}

  /**
   * Get all entity associations for a specific tax.
   *
   * @param taxId - Tax configuration ID
   * @returns Array of entity-tax associations
   */
  async getByTaxId(taxId: string): Promise<EntityTaxConfig[]> {
    return await this.entityTaxConfigRepository.findByTaxId(taxId);
  }

  /**
   * Get all tax associations for a specific entity.
   *
   * @param entityType - Type of entity (PRODUCT, CATEGORY, ZONE)
   * @param entityId - Entity ID
   * @returns Array of entity-tax associations
   */
  async getByEntity(
    entityType: string,
    entityId: string,
  ): Promise<EntityTaxConfig[]> {
    return await this.entityTaxConfigRepository.findByEntity(
      entityType,
      entityId,
    );
  }
}
