import {
  IngredientForecast as PrismaIngredientForecast,
  Prisma,
} from '@prisma/client';

// ─── Minimal forecast row used by the overview service ───────────────────────
export type ForecastRow = {
  ingredient_id: string;
  predicted_usage: Prisma.Decimal;
  upper_bound: Prisma.Decimal;
  forecast_date: Date;
};

export abstract class IngredientForecastRepository {
  /**
   * Returns lightweight forecast rows for every ingredient that has a forecast
   * on `date`.  Only touches the `ingredient_forecasts` table.
   */
  abstract findByDate(date: Date): Promise<ForecastRow[]>;

  /**
   * Returns full forecast rows for a single ingredient where
   * `forecast_date > from` and `forecast_date <= to` (exclusive start).
   */
  abstract findByIngredientAndDateRange(
    ingredientId: string,
    from: Date,
    to: Date,
  ): Promise<PrismaIngredientForecast[]>;
}
