/**
 * Represents a failure that occurred during a bulk tax operation.
 *
 * @property {string} id - The unique identifier of the item that failed during the bulk operation.
 * @property {string} [type] - Optional. The type or category of the item that failed (e.g., entity type, operation type).
 * @property {string} error - A description of the error or reason for the failure.
 */
export interface TaxBulkOperationFailure {
  id: string;
  type?: string;
  error: string;
}
