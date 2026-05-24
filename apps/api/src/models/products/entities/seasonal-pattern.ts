/**
 * Represents a seasonal demand pattern, such as holidays, peak hours, or weekends.
 *
 * @property id Unique identifier for the pattern.
 * @property name Human-readable label.
 * @property patternType Broad category of the pattern.
 * @property startDate Inclusive start date for date-range patterns (holidays).
 * @property endDate Inclusive end date for date-range patterns (holidays).
 * @property dayOfWeek Day-of-week index (0 = Sunday … 6 = Saturday) for weekly patterns.
 * @property hourOfDay Hour of day (0–23) for sub-daily patterns such as lunch or dinner rush.
 * @property multiplier Demand multiplier applied during this pattern.
 * @property isActive Whether the pattern is currently active.
 * @property description Optional free-text notes for operators.
 * @property createdAt Timestamp when the pattern was created.
 * @property updatedAt Timestamp when the pattern was last updated.
 */
export class SeasonalPattern {
  constructor(
    public id: string | null = null,
    public name: string,
    public patternType: string,
    public startDate: Date | null,
    public endDate: Date | null,
    public dayOfWeek: number | null,
    public hourOfDay: number | null,
    public multiplier: number,
    public isActive: boolean,
    public description: string | null,
    public createdAt: Date | null = null,
    public updatedAt: Date | null = null,
  ) {}
}
