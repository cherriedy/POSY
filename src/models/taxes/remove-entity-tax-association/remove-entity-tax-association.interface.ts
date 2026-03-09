import { BulkOperationStatus } from '../../../common/types';

/**
 * Payload for bulk removing entity-tax associations by their unique IDs.
 *
 * @property {string} taxId - The identifier of the tax configuration (used for context/logging).
 * @property {string[]} associationIds - Array of association IDs (1-100) to remove.
 */
export interface TaxAssociationBulkRemovePayload {
  taxId: string;
  associationIds: string[];
}

/**
 * Represents a failure that occurred during a bulk tax operation.
 *
 * @property {string} id - The unique identifier of the item that failed during the bulk operation.
 * @property {EntityType} [type] - Optional. The type or category of the item that failed.
 * @property {string} error - A description of the error or reason for the failure.
 */
export interface TaxAssociationBulkDeleteResultItem {
  id: string;
  status: BulkOperationStatus;
  error?: string;
}
