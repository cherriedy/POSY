import { UnitOfWork } from './unit-of-work.abstract';
import { PrismaService } from '../../providers/prisma/prisma.service';
import { Injectable } from '@nestjs/common';

@Injectable()
export class PrismaUnitOfWork implements UnitOfWork {
  constructor(private readonly prismaService: PrismaService) {}

  /**
   * Executes the provided asynchronous function inside a Prisma database transaction.
   *
   * This method delegates to Prisma's interactive `$transaction` API and ensures:
   * - The transaction is automatically committed if the function resolves successfully.
   * - The transaction is automatically rolled back if the function throws or rejects.
   *
   * The provided function should contain all database operations that must be executed atomically.
   * Any unhandled error thrown within the callback will cause the entire transaction to roll back.
   *
   * @template T The return type of the transactional operation.
   * @param fn An asynchronous callback containing all operations to execute within the transaction.
   * @returns A promise that resolves with the result returned by the callback.
   *
   * @throws Rethrows any error thrown inside the transactional callback after rollback.
   *
   * @example
   * await transaction.execute(async () => {
   *   await prisma.user.create({ data: {...} });
   *   await prisma.order.create({ data: {...} });
   * });
   */
  async execute<T>(fn: () => Promise<T>): Promise<T> {
    return await this.prismaService.$transaction(async () => {
      return await fn();
    });
  }
}
