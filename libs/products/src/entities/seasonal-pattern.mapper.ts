import { SeasonalPattern } from './seasonal-pattern';
import {
  SeasonalPattern as PrismaSeasonalPattern,
  Prisma,
} from '@prisma/client';

export class SeasonalPatternMapper {
  /**
   * Converts a raw Prisma {@link PrismaSeasonalPattern} row into a domain
   * {@link SeasonalPattern} instance.
   *
   * `Decimal` fields are coerced to `number` via `Number()` so that the
   * domain layer never deals with Prisma-specific types.
   *
   * @param prisma - The raw Prisma row returned from the database.
   * @returns A hydrated {@link SeasonalPattern} domain entity.
   */
  static toDomain(this: void, prisma: PrismaSeasonalPattern): SeasonalPattern {
    return new SeasonalPattern(
      prisma.id,
      prisma.name,
      prisma.pattern_type,
      prisma.start_date,
      prisma.end_date,
      prisma.day_of_week,
      prisma.hour_of_day,
      Number(prisma.multiplier),
      prisma.is_active,
      prisma.description,
      prisma.created_at,
      prisma.updated_at,
    );
  }

  /**
   * Converts a domain {@link SeasonalPattern} entity into a Prisma
   * {@link Prisma.SeasonalPatternUncheckedCreateInput} suitable for `create`
   * or the `create` branch of an `upsert` call.
   *
   * Note: `id`, `created_at`, and `updated_at` are omitted — the database generates
   * or manages them automatically.
   *
   * @param domain - The domain entity to serialize.
   * @returns The Prisma create-input payload.
   */
  static toPrisma(
    domain: SeasonalPattern,
  ): Prisma.SeasonalPatternUncheckedCreateInput {
    return {
      name: domain.name,
      pattern_type: domain.patternType,
      start_date: domain.startDate,
      end_date: domain.endDate,
      day_of_week: domain.dayOfWeek,
      hour_of_day: domain.hourOfDay,
      multiplier: new Prisma.Decimal(domain.multiplier),
      is_active: domain.isActive,
      description: domain.description,
    };
  }
}
