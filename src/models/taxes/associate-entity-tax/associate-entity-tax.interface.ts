import { TaxableEntityReference } from '../interfaces';
import { BulkOperationStatus } from '../../../common/types';
import { EntityTaxConfig } from '../entities';

/**
 * Represents an individual item in a bulk tax association upsert operation, including the entity reference,
 * optional active status, and an optional note.
 *
 * @property {TaxableEntityReference} entityRef - Reference to the taxable entity (e.g., zone, item category).
 * @property {boolean} [isActive] - Optional. Indicates whether the tax association should be active.
 * @property {string} [note] - Optional. Additional notes or comments about the tax association.
 */
export interface TaxAssociationBulkUpsertItem {
  entityRef: TaxableEntityReference;
  isActive?: boolean;
  note?: string;
}

/**
 * Payload for creating tax associations linking a tax to one or more entities.
 *
 * @property {string} taxId - The identifier of the tax to associate.
 * @property {TaxAssociationBulkUpsertItem[]} items - An array of items representing the entities to associate with the tax.
 * @property {boolean} [isActive] - Optional. If true, the association will be active on creation.
 * @property {string} [note] - Optional. Additional notes or comments about the association.
 */
export interface TaxAssociationBulkUpsertPayload {
  taxId: string;
  items: TaxAssociationBulkUpsertItem[];
}

/**
 * Per-item result for a bulk tax association upsert operation.
 *
 * @property {TaxableEntityReference} entityRef - Reference to the taxable entity for which the tax association was upserted.
 * @property {BulkOperationStatus} status - The result status of the upsert operation for this item.
 * @property {EntityTaxConfig} [config] - The resulting tax association configuration if the operation succeeded.
 * @property {string} [error] - An error message describing the reason for failure if the operation failed.
 */
export interface TaxAssociationBulkUpsertResultItem {
  entityRef: TaxableEntityReference;
  status: BulkOperationStatus;
  config?: EntityTaxConfig;
  error?: string;
}
