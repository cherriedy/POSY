import { BulkOperationStatus } from '../../../common/types';
import { TaxableEntityReference } from '../interfaces';

/**
 * Represents the payload for bulk removing tax associations from entities.
 *
 * @property {string} taxId - The unique identifier of the tax configuration from which associations are being removed.
 * @property {TaxableEntityReference[]} entities - An array of references to the entities for which the tax associations should be removed.
 */
export interface TaxAssociationBulkRemovePayload {
  taxId: string;
  entities: TaxableEntityReference[];
}

/**
 * Represents a failure that occurred during a bulk tax operation.
 *
 * @property {TaxableEntityReference} entity - The reference to the taxable entity for which the operation failed.
 * @property {EntityType} [type] - Optional. The type or category of the item that failed.
 * @property {string} error - A description of the error or reason for the failure.
 */
export interface TaxAssociationBulkDeleteResultItem {
  entity: TaxableEntityReference;
  status: BulkOperationStatus;
  error?: string;
}
