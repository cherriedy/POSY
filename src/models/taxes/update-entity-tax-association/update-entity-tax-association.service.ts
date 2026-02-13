import { Injectable } from '@nestjs/common';
import { EntityTaxConfigRepository } from '../repositories';
import {
  TaxAssociationUpdateItem,
  TaxBulkOperationFailure,
} from '../interfaces';
import { TaxAssociationNotFoundException } from '../exceptions';

@Injectable()
export class UpdateEntityTaxAssociationService {
  constructor(
    private readonly entityTaxConfigRepository: EntityTaxConfigRepository,
  ) {}

  /**
   * Updates one or more entity-tax associations in a best-effort manner.
   *
   * Each association update is processed individually. If an update fails (e.g., the association is not found),
   * the error is recorded and the method continues processing the remaining updates. This allows partial success
   * and provides detailed feedback for each failure.
   *
   * Constraints:
   * - Supports 1 to 100 associations per request.
   * - Each update object must include the association's unique ID, and may include updated values for isActive and note.
   *
   * @param {TaxAssociationUpdateItem[]} updates - Array of update objects, each containing:
   *   - id: string (required) — The unique identifier of the association to update.
   *   - isActive?: boolean (optional) — Whether the association should be active.
   *   - note?: string (optional) — Additional notes for the association.
   *
   * @returns {Promise<{ successCount: number; failures: TaxBulkOperationFailure[] }>} An object containing:
   *   - successCount: number — The number of successful updates.
   *   - failures: TaxBulkOperationFailure[] — Array of failure details for associations that could not be updated.
   *     Each failure includes the association ID and an error message.
   */
  async bulkUpdate(updates: TaxAssociationUpdateItem[]): Promise<{
    successCount: number;
    failures: Array<TaxBulkOperationFailure>;
  }> {
    let successCount = 0;
    const failures: Array<TaxBulkOperationFailure> = [];

    // Process each update individually (best-effort)
    for (const update of updates) {
      try {
        await this.entityTaxConfigRepository.update!(update.id, {
          isActive: update.isActive,
          note: update.note,
        });
        successCount++;
      } catch (e) {
        let errorMessage = 'Unknown error occurred';

        if (e instanceof TaxAssociationNotFoundException) {
          errorMessage = `Association with ID ${update.id} not found`;
        } else if (e instanceof Error) {
          errorMessage = e.message;
        }

        failures.push({
          id: update.id,
          error: errorMessage,
        });
      }
    }

    return { successCount, failures };
  }
}
