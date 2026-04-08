/**
 * Represents aggregated usage of an ingredient for a specific day (and optionally hour) across all orders.
 * This entity is designed to support efficient querying of ingredient consumption patterns for inventory
 * management and forecasting.
 *
 * @param id Unique identifier for the usage record.
 * @param ingredientId Foreign key referencing the associated {@link Ingredient}.
 * @param usageDate The calendar day this usage record aggregates.
 * @param quantityUsed Total quantity of the ingredient consumed across all orders in this bucket.
 * @param orderCount Number of individual orders that contributed to this usage bucket.
 * @param dayOfWeek Day-of-week index (0 = Sunday … 6 = Saturday).
 * @param hourOfDay Hour bucket (0–23) for sub-daily granularity.
 * @param isWeekend Whether the usage date falls on a weekend.
 * @param isHoliday Whether the usage date overlaps with any active {@link SeasonalPattern} of type `"HOLIDAY"`.
 * @param createdAt Timestamp when the record was created.
 */
export class IngredientUsage {
  constructor(
    public id: string | null = null,
    public ingredientId: string,
    public usageDate: Date,
    public quantityUsed: number,
    public orderCount: number,
    public dayOfWeek: number,
    public hourOfDay: number | null,
    public isWeekend: boolean,
    public isHoliday: boolean,
    public createdAt: Date | null = null,
  ) {}
}
