import { BaseRepository } from '../../../../common/interfaces';
import { IngredientUsage } from '../entities';

export abstract class IngredientUsageRepository extends BaseRepository<IngredientUsage> {
  /**
   * Atomically inserts or increments a batch of ingredient-usage buckets.
   *
   * Each entry in `entities` is matched against the unique constraint
   * `(ingredient_id, usage_date, hour_of_day)`.  If a matching row exists its
   * `quantity_used` and `order_count` columns are incremented; otherwise a new
   * row is inserted.
   *
   * The entire batch is executed inside a single database transaction so the
   * caller can treat it as an all-or-nothing operation.
   *
   * @param entities - One {@link IngredientUsage} per unique combination to upsert.
   * @returns A promise that resolves when all upserts are complete.
   * @throws Any database error encountered during the transaction is re-thrown.
   */
  abstract upsertBatch(entities: IngredientUsage[]): Promise<void>;

  /**
   * Retrieves all usage records for a given ingredient within an inclusive
   * date range, ordered chronologically.
   *
   * Typically used by the forecasting pipeline to load the historical time
   * series that is fed into the Prophet model.
   *
   * @param ingredientId - The UUID of the ingredient to query.
   * @param from - Start of the date range (inclusive).
   * @param to - End of the date range (inclusive).
   * @returns An array of {@link IngredientUsage} entities, sorted by
   *   `usage_date` ascending then `hour_of_day` ascending.
   */
  abstract findByIngredientIdAndDateRange(
    ingredientId: string,
    from: Date,
    to: Date,
  ): Promise<IngredientUsage[]>;
}
