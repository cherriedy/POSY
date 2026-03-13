import { Inject, Injectable } from '@nestjs/common';
import { EntityTaxConfigRepository } from '../repositories';
import { TaxAssociationNotFoundException } from '../exceptions';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import {
  TaxAssociationBulkDeleteResultItem,
  TaxAssociationBulkRemovePayload,
} from './remove-entity-tax-association.interface';

@Injectable()
export class RemoveEntityTaxAssociationService {
  @Inject(WINSTON_MODULE_PROVIDER)
  private readonly logger: import('winston').Logger;

  constructor(
    private readonly entityTaxConfigRepository: EntityTaxConfigRepository,
  ) {}

  /**
   * Removes one or more entity-tax associations in a best-effort manner.
   *
   * Each association ID in the payload is processed individually. If an association does not exist or cannot be deleted,
   * the error is recorded and the method continues processing the remaining IDs. This allows partial success and provides
   * detailed feedback for each failure.
   *
   * Constraints:
   * - Supports 1 to 100 association IDs per request.
   * - Each ID must correspond to an existing entity-tax association for successful removal.
   *
   * @param {TaxAssociationBulkRemovePayload} payload - Contains taxId and array of association IDs to remove (1-100).
   * @return {Promise<TaxAssociationBulkDeleteResultItem[]>} - Array of results for each association ID, indicating success or failure with error details if applicable.
   *
   */
  async bulkRemove(
    payload: TaxAssociationBulkRemovePayload,
  ): Promise<TaxAssociationBulkDeleteResultItem[]> {
    const results: TaxAssociationBulkDeleteResultItem[] = [];

    for (const entity of payload.entities) {
      try {
        await this.entityTaxConfigRepository.delete(payload.taxId, entity);
        results.push({ entity, status: 'SUCCEED' });
      } catch (e) {
        let error = 'Unknown error occurred';
        if (e instanceof TaxAssociationNotFoundException) {
          error = e.message;
        } else if (e instanceof Error) {
          this.logger.error(e.message);
        }
        results.push({ entity, status: 'FAILED', error });
      }
    }

    return results;
  }
}
