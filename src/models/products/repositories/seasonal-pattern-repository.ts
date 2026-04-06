import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../providers/prisma/prisma.service';
import { SeasonalPatternRepository } from './seasonal-pattern-repository.abstract';
import { SeasonalPattern, SeasonalPatternMapper } from '../entities';

@Injectable()
export class SeasonalPatternRepositoryImpl implements SeasonalPatternRepository {
  constructor(private readonly prismaService: PrismaService) {}

  /**
   * Returns `true` when the given date falls inside at least one active
   * holiday pattern.
   *
   * The query matches rows where:
   * - `pattern_type = 'HOLIDAY'`
   * - `is_active = true`
   * - `start_date <= date` **and** `end_date >= date`
   *
   * @param date - The date to evaluate against stored holiday patterns.
   * @returns A promise resolving to `true` if the date is a holiday, `false`
   *   otherwise.
   */
  async isHoliday(date: Date): Promise<boolean> {
    const count = await this.prismaService.seasonalPattern.count({
      where: {
        pattern_type: 'HOLIDAY',
        is_active: true,
        start_date: { lte: date },
        end_date: { gte: date },
      },
    });
    return count > 0;
  }

  /**
   * Retrieves all active {@link SeasonalPattern} entities whose
   * `pattern_type` matches the provided value, ordered by `created_at`
   * ascending so the oldest patterns are returned first.
   *
   * @param patternType - The category to filter on (e.g. `"HOLIDAY"`, `"PEAK_HOUR"`, `"WEEKEND"`).
   * @returns An array of matching {@link SeasonalPattern} domain entities.
   */
  async findActiveByType(patternType: string): Promise<SeasonalPattern[]> {
    const rows = await this.prismaService.seasonalPattern.findMany({
      where: { pattern_type: patternType, is_active: true },
      orderBy: { created_at: 'asc' },
    });
    return rows.map(SeasonalPatternMapper.toDomain);
  }
}
