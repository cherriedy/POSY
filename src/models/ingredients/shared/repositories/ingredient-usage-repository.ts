import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../../providers/prisma/prisma.service';
import { IngredientUsageRepository } from './ingredient-usage-repository.abstract';
import { IngredientUsage, IngredientUsageMapper } from '../entities';

@Injectable()
export class IngredientUsageRepositoryImpl implements IngredientUsageRepository {
  constructor(private readonly prismaService: PrismaService) {}

  /**
   * Atomically inserts or increments a batch of ingredient-usage buckets
   * within a single Prisma transaction.
   *
   * Each entity is matched by the unique constraint `(ingredient_id, usage_date, hour_of_day)`.
   * On conflict the existing row's `quantity_used` is incremented by the new value and `order_count`
   * is incremented by one.  If no matching row exists a new record is inserted with the provided values.
   *
   * @param entities - Array of {@link IngredientUsage} entities to upsert.
   * @returns A promise that resolves when the transaction completes.
   * @throws Any Prisma / database error encountered during the transaction.
   */
  async upsertBatch(entities: IngredientUsage[]): Promise<void> {
    if (entities.length === 0) return;

    await this.prismaService.$transaction(
      entities.map((entity) => {
        const data = IngredientUsageMapper.toPrisma(entity);
        return this.prismaService.ingredientUsage.upsert({
          where: {
            ingredient_id_usage_date_hour_of_day: {
              ingredient_id: entity.ingredientId,
              usage_date: entity.usageDate,
              hour_of_day: entity.hourOfDay ?? 0,
            },
          },
          create: data,
          update: {
            quantity_used: { increment: data.quantity_used },
            order_count: { increment: 1 },
          },
        });
      }),
    );
  }

  /**
   * Retrieves all usage records for a given ingredient within an inclusive
   * date range, ordered by `usage_date` then `hour_of_day` ascending.
   *
   * @param ingredientId - UUID of the ingredient to query.
   * @param from - Start of the inclusive date range.
   * @param to - End of the inclusive date range.
   * @returns Array of matching {@link IngredientUsage} domain entities.
   */
  async findByIngredientIdAndDateRange(
    ingredientId: string,
    from: Date,
    to: Date,
  ): Promise<IngredientUsage[]> {
    const rows = await this.prismaService.ingredientUsage.findMany({
      where: {
        ingredient_id: ingredientId,
        usage_date: { gte: from, lte: to },
      },
      orderBy: [{ usage_date: 'asc' }, { hour_of_day: 'asc' }],
    });
    return rows.map(IngredientUsageMapper.toDomain);
  }
}
