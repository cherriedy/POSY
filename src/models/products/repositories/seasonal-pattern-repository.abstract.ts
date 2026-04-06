import { BaseRepository } from '../../../common/interfaces';
import { SeasonalPattern } from '../entities';

export abstract class SeasonalPatternRepository extends BaseRepository<SeasonalPattern> {
  /**
   * Checks whether the given date falls within any **active** holiday pattern.
   *
   * A date is considered a holiday when at least one {@link SeasonalPattern} row satisfies the following:
   * - `pattern_type === 'HOLIDAY'`
   * - `is_active === true`
   * - `start_date <= date <= end_date`
   *
   * @param date - The date to evaluate against stored holiday patterns.
   * @returns `true` if the date overlaps with at least one active holiday pattern; `false` otherwise.
   */
  abstract isHoliday(date: Date): Promise<boolean>;

  /**
   * Retrieves all active seasonal patterns of a given type.
   *
   * Typically used by the forecasting pipeline to load holiday or peak-hour
   * definitions before training the Prophet model.
   *
   * @param patternType - The pattern category to filter by
   *   (e.g. `"HOLIDAY"`, `"PEAK_HOUR"`, `"WEEKEND"`).
   * @returns An array of active {@link SeasonalPattern} entities matching the
   *   requested type, ordered by `created_at` ascending.
   */
  abstract findActiveByType(patternType: string): Promise<SeasonalPattern[]>;
}
