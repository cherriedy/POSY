import { PricingSnapshotTax } from '../entities';
import { BaseRepository } from '../../../common/interfaces';

export abstract class PricingSnapshotTaxRepository extends BaseRepository<PricingSnapshotTax> {
  /**
   * Finds all PricingSnapshotTax entities associated with a given snapshot ID.
   *
   * @param {string} snapshotId - The unique identifier of the pricing snapshot.
   * @returns {Promise<PricingSnapshotTax[]>} A promise that resolves to an array of PricingSnapshotTax entities.
   */
  abstract findBySnapshotId(snapshotId: string): Promise<PricingSnapshotTax[]>;

  /**
   * Creates multiple PricingSnapshotTax entities in bulk.
   *
   * @param {PricingSnapshotTax[]} entities - An array of PricingSnapshotTax entities to be created.
   * @returns {Promise<PricingSnapshotTax[]>} A promise that resolves to the created PricingSnapshotTax entities.
   */
  abstract bulkCreate(
    entities: PricingSnapshotTax[],
  ): Promise<PricingSnapshotTax[]>;
}
