import { Inject, Injectable, LoggerService } from '@nestjs/common';
import { IngredientUsageRepository } from '../../shared';
import { IngredientUsage } from '../../shared';
import { ProductIngredientRepository } from '../../../products/repositories/product-ingredient-repository.abstract';
import { SeasonalPatternRepository } from '../../../products/repositories/seasonal-pattern-repository.abstract';
import { OrderItem } from '../../../orders';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';

@Injectable()
export class RecordIngredientUsageService {
  @Inject(WINSTON_MODULE_NEST_PROVIDER)
  private readonly logger: LoggerService;

  constructor(
    private readonly productIngredientRepository: ProductIngredientRepository,
    private readonly usageRepository: IngredientUsageRepository,
    private readonly patternRepository: SeasonalPatternRepository,
  ) {}

  /**
   * Derives and persists ingredient usage from a completed set of order items.
   *
   * @param orderItems - The persisted {@link OrderItem} entities belonging to
   *   the newly created order.  Items with products that have no
   *   {@link ProductIngredient} mappings are silently skipped.
   * @param orderDate - The timestamp at which the order was placed.  Used to
   *   derive `usage_date`, `hour_of_day`, `day_of_week`, `is_weekend`, and
   *   `is_holiday`.
   * @returns A promise that resolves when recording is complete
   *
   * @remarks
   * The method is intentionally **non-throwing**: any error is caught, logged,
   * and swallowed so that a failure here never rolls back the parent order creation.
   */
  async record(orderItems: OrderItem[], orderDate: Date): Promise<void> {
    try {
      await this.doRecord(orderItems, orderDate);
    } catch (err) {
      this.logger.error(
        'There was an error recording ingredient usage',
        err instanceof Error ? err.stack : String(err),
      );
    }
  }

  // ---------------------------------------------------------------------------
  // Private helpers
  // ---------------------------------------------------------------------------

  /**
   * Core recording logic extracted from {@link record} so that errors propagate naturally and
   * can be caught by the public wrapper.
   *
   * @param orderItems - Persisted order items to process.
   * @param orderDate - Timestamp of the order.
   */
  private async doRecord(
    orderItems: OrderItem[],
    orderDate: Date,
  ): Promise<void> {
    if (orderItems.length === 0) return;

    const isHoliday = await this.patternRepository.isHoliday(orderDate);
    const usageDate = this.truncateToDay(orderDate);
    const hourOfDay = orderDate.getHours();
    const dayOfWeek = orderDate.getDay();
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;

    /**
     * Aggregate quantities per ingredient across all order items before
     * persisting so we produce at most one upsert per ingredient per call.
     */
    const usage = new Map<
      string,
      { quantityUsed: number; orderCount: number }
    >();

    await Promise.all(
      orderItems.map(async (item) => {
        const productIngredients =
          await this.productIngredientRepository.findByProductId(
            item.productId,
          );

        for (const pi of productIngredients) {
          const quantityUsed = item.quantity * pi.quantity;
          const existing = usage.get(pi.ingredientId);

          if (existing) {
            existing.quantityUsed += quantityUsed;
            existing.orderCount += 1;
          } else {
            usage.set(pi.ingredientId, {
              quantityUsed,
              orderCount: 1,
            });
          }
        }
      }),
    );

    if (usage.size === 0) return;

    const usageEntities: IngredientUsage[] = Array.from(usage.entries()).map(
      ([ingredientId, { quantityUsed, orderCount }]) =>
        new IngredientUsage(
          null,
          ingredientId,
          usageDate,
          quantityUsed,
          orderCount,
          dayOfWeek,
          hourOfDay,
          isWeekend,
          isHoliday,
          null,
        ),
    );

    await this.usageRepository.upsertBatch(usageEntities);
  }

  /**
   * Truncates a {@link Date} to midnight UTC so that all upserts for the
   * same calendar day share the same `usage_date` key regardless of what
   * time zone the server runs in.
   *
   * @param date - The datetime to truncate.
   * @returns A new {@link Date} set to `YYYY-MM-DDT00:00:00.000Z`.
   */
  private truncateToDay(date: Date): Date {
    return new Date(
      Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()),
    );
  }
}
