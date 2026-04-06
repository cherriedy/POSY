import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../../providers/prisma/prisma.service';
import { PricingSnapshotRepository } from './pricing-snapshot-repository.abstract';
import {
  PricingSnapshot,
  PricingSnapshotMapper,
} from '../../../promotions/types';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/client';
import { OrderSnapshotNotFoundException } from '../exceptions';

@Injectable()
export class PricingSnapshotRepositoryImpl implements PricingSnapshotRepository {
  constructor(private readonly prismaService: PrismaService) {}

  /**
   * Creates a new pricing snapshot in the database.
   *
   * @param entity - The PricingSnapshot domain entity to persist.
   * @returns The created PricingSnapshot domain entity.
   */
  async create(entity: PricingSnapshot): Promise<PricingSnapshot> {
    const prismaData = PricingSnapshotMapper.toPrisma(entity);
    return this.prismaService.pricingSnapshot
      .create({ data: prismaData })
      .then(PricingSnapshotMapper.toDomain);
  }

  /**
   * Finds a pricing snapshot by the associated order ID.
   *
   * @param orderId - The ID of the order whose pricing snapshot is to be retrieved.
   * @returns The found PricingSnapshot domain entity, or null if not found.
   */
  async findByOrderId(orderId: string): Promise<PricingSnapshot | null> {
    const snapshot = await this.prismaService.pricingSnapshot.findUnique({
      where: { order_id: orderId },
      include: { taxes: true, promotions: true },
    });
    return snapshot ? PricingSnapshotMapper.toDomain(snapshot) : null;
  }

  /**
   * Deletes a pricing snapshot by the associated order ID.
   *
   * @param orderId - The ID of the order whose pricing snapshot is to be deleted.
   * @throws OrderSnapshotNotFoundException if the snapshot does not exist.
   */
  async deleteByOrderId(orderId: string): Promise<void> {
    try {
      await this.prismaService.pricingSnapshot.delete({
        where: { order_id: orderId },
      });
    } catch (e) {
      if (e instanceof PrismaClientKnownRequestError) {
        if (e.code === 'P2025') {
          throw new OrderSnapshotNotFoundException(orderId);
        }
      }
    }
  }
}
