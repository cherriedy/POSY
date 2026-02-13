import { Injectable } from '@nestjs/common';
import { EntityTaxConfigRepository } from '../repositories';
import { TaxAssociationNotFoundException } from '../exceptions';
import { TaxBulkOperationFailure } from '../interfaces';

@Injectable()
export class RemoveEntityTaxAssociationService {
  constructor(
    private readonly entityTaxConfigRepository: EntityTaxConfigRepository,
  ) {}

  /**
   * Removes one or more entity-tax associations in a best-effort manner.
   *
   * Each association ID in the input array is processed individually. If an association does not exist or cannot be deleted,
   * the error is recorded and the method continues processing the remaining IDs. This allows partial success and provides
   * detailed feedback for each failure.
   *
   * Constraints:
   * - Supports 1 to 100 association IDs per request.
   * - Each ID must correspond to an existing entity-tax association for successful removal.
   *
   * @param {string[]} ids - Array of association IDs to remove (1-100). Each ID should uniquely identify an entity-tax association.
   *
   * @returns {Promise<{ successCount: number; failures: TaxBulkOperationFailure[] }>} An object containing:
   *   - successCount: number — The number of associations successfully removed.
   *   - failures: TaxBulkOperationFailure[] — Array of failure details for associations that could not be removed. Each failure includes the association ID and an error message.
   */
  async bulkRemove(ids: string[]): Promise<{
    successCount: number;
    failures: Array<TaxBulkOperationFailure>;
  }> {
    let successCount = 0;
    const failures: Array<TaxBulkOperationFailure> = [];

    // Process each deletion individually (best-effort)
    for (const id of ids) {
      try {
        // Check if association exists
        const association = await this.entityTaxConfigRepository.findById(id);
        if (!association) {
          failures.push({ id, error: `Association with ID ${id} not found` });
          continue;
        }

        // Delete using bulkDelete for a single ID
        const result = await this.entityTaxConfigRepository.bulkDelete([id]);
        if (result > 0) {
          successCount++;
        } else {
          failures.push({
            id,
            error: `Failed to delete association with ID ${id}`,
          });
        }
      } catch (e) {
        let errorMessage = 'Unknown error occurred';
        if (e instanceof TaxAssociationNotFoundException) {
          errorMessage = `Association with ID ${id} not found`;
        } else if (e instanceof Error) {
          errorMessage = e.message;
        }
        failures.push({ id, error: errorMessage });
      }
    }

    return { successCount, failures };
  }
}
