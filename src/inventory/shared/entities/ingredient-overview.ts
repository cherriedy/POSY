import { StockStatus } from '../enum';

/**
 * Represents a combined view of an ingredient's forecast and current stock
 * for a specific target date.  Used to build the inventory overview dashboard.
 *
 * @param ingredientId  Foreign key of the associated Ingredient.
 * @param name          Human-readable ingredient name.
 * @param unit          Unit abbreviation (e.g. "kg", "ml").
 * @param currentStock  Current physical stock level.
 * @param predictedUsage Predicted usage for the target date.
 * @param upperBound    Upper confidence-interval bound of the prediction.
 * @param forecastDate  The calendar date the forecast applies to.
 * @param stockStatus   Computed risk level (SAFE / WARNING / DANGER).
 */
export class IngredientOverview {
  constructor(
    public ingredientId: string,
    public name: string,
    public unit: string,
    public currentStock: number,
    public predictedUsage: number,
    public upperBound: number,
    public forecastDate: Date,
    public stockStatus: StockStatus,
  ) {}

  /**
   * Derives the stock status by comparing the current stock against the
   * predicted usage and its upper bound.
   *
   * - DANGER  : stock < predicted_usage       (will run out even in the best case)
   * - WARNING : stock < upper_bound           (may run out if demand peaks)
   * - SAFE    : stock >= upper_bound
   */
  static computeStockStatus(
    currentStock: number,
    predictedUsage: number,
    upperBound: number,
  ): StockStatus {
    if (currentStock < predictedUsage) return StockStatus.DANGER;
    if (currentStock < upperBound) return StockStatus.WARNING;
    return StockStatus.SAFE;
  }
}
