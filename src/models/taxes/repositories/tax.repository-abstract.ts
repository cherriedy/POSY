import { BaseRepository, Page } from '../../../common/interfaces';
import { TaxConfig } from '../types';
import { TaxQueryParams } from '../interfaces';

export abstract class TaxRepository extends BaseRepository<TaxConfig> {
  /**
   * Find a tax configuration by ID
   * @param id - Tax configuration ID
   * @returns The tax configuration or null if not found
   */
  abstract findById(id: string): Promise<TaxConfig | null>;

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
