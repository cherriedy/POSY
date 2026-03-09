import { BaseRepository, Page } from '../../../common/interfaces';
import { TaxConfig } from '../entities';
import { TaxQueryParams } from '../interfaces';
import { TaxType } from '../enums';

export abstract class TaxRepository extends BaseRepository<TaxConfig> {
  /**
   * Find a tax configuration by ID
   * @param id - Tax configuration ID
   * @returns The tax configuration or null if not found
   */
  abstract findById(id: string): Promise<TaxConfig | null>;

  /**
   * Find tax configurations by their entities
   * @param type - Array of tax entities to filter by
   * @returns Array of tax configurations matching the specified entities
   */
  abstract findByType(type: TaxType[]): Promise<TaxConfig[]>;

  /**
   * Create a new tax configuration
   * @param tax - Tax configuration to create
   * @returns The created tax configuration
   */
  abstract create(tax: TaxConfig): Promise<TaxConfig>;

  /**
   * Update an existing tax configuration
   * @param id - Tax configuration ID
   * @param tax - Partial tax configuration data to update
   * @returns The updated tax configuration
   */
  abstract update(id: string, tax: Partial<TaxConfig>): Promise<TaxConfig>;

  /**
   * Delete a tax configuration (soft delete)
   * @param id - Tax configuration ID
   */
  abstract delete(id: string): Promise<void>;

  /**
   * Get all tax configurations with pagination and filtering
   * @param params - Query parameters including filters and pagination
   * @returns Paginated tax configurations
   */
  abstract getAllPaged(params?: TaxQueryParams): Promise<Page<TaxConfig>>;

  /**
   * Get all active tax configurations
   * @returns Array of active tax configurations
   */
  abstract getActiveTaxes(): Promise<TaxConfig[]>;
}
