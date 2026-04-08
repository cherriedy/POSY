import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../providers/prisma/prisma.service';
import { PricingSnapshotTaxRepository } from './pricing-snapshot-tax-repository.abstract';
import { PricingSnapshotTax, PricingSnapshotTaxMapper } from '../entities';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/client';
import {
  DuplicateEntryException,
  RelatedRecordNotFoundException,
} from '../../../common/exceptions';

@Injectable()
export class PricingSnapshotTaxRepositoryImpl implements PricingSnapshotTaxRepository {
  constructor(private readonly prismaService: PrismaService) {}

  /**
   * Persists multiple PricingSnapshotTax entities in a single transaction.
   *
   * @param entities - Array of PricingSnapshotTax domain entities to persist.
   * @returns Promise resolving to the created PricingSnapshotTax domain entities.
   * @throws DuplicateEntryException if a unique constraint is violated (P2002).
   * @throws RelatedRecordNotFoundException if a foreign key constraint is violated (P2003).
   */
  async bulkCreate(
    entities: PricingSnapshotTax[],
  ): Promise<PricingSnapshotTax[]> {
    const prismaItems = entities.map((entity) =>
      PricingSnapshotTaxMapper.toPrisma(entity),
    );
    try {
      return await this.prismaService
        .$transaction(
          prismaItems.map((item) => {
            return this.prismaService.pricingSnapshotTax.create({
              data: item,
            });
          }),
        )
        .then((items) =>
          items.map((item) => PricingSnapshotTaxMapper.toDomain(item)),
        );
    } catch (e) {
      if (e instanceof PrismaClientKnownRequestError) {
        switch (e.code) {
          case 'P2002':
            throw new DuplicateEntryException(
              'Please check the provided data for duplicates and try again.',
            );
          case 'P2003':
            throw new RelatedRecordNotFoundException(
              'Please ensure all referenced records exist and try again.',
            );
        }
      }
      throw e;
    }
  }

  /**
   * Retrieves all PricingSnapshotTax entities associated with a given snapshot ID.
   *
   * @param snapshotId - The identifier of the pricing snapshot.
   * @returns Promise resolving to an array of PricingSnapshotTax domain entities.
   */
  async findBySnapshotId(snapshotId: string): Promise<PricingSnapshotTax[]> {
    const found = await this.prismaService.pricingSnapshotTax.findMany({
      where: { snapshot_id: snapshotId },
    });
    return found.map((row) => PricingSnapshotTaxMapper.toDomain(row));
  }
}
