import { IngredientForecast } from './ingredient-forecast';
import {
  IngredientForecast as PrismaIngredientForecast,
  Prisma,
} from '@prisma/client';

export class IngredientForecastMapper {
  /**
   * Converts a Prisma {@link PrismaIngredientForecast} row into a domain
   * {@link IngredientForecast} instance.
   *
   * `Decimal` fields are coerced to `number` via `Number()` so that the
   * domain layer never deals with Prisma-specific types.
   *
   * @param prisma - The raw Prisma row returned from the database.
   * @returns A hydrated {@link IngredientForecast} domain entity.
   */
  static toDomain(
    this: void,
    prisma: PrismaIngredientForecast,
  ): IngredientForecast {
    return new IngredientForecast(
      prisma.id,
      prisma.ingredient_id,
      prisma.forecast_date,
      Number(prisma.predicted_usage),
      Number(prisma.lower_bound),
      Number(prisma.upper_bound),
      Number(prisma.confidence_level),
      prisma.model_version,
      prisma.created_at,
    );
  }

  /**
   * Converts a domain {@link IngredientForecast} entity into a Prisma
   * {@link Prisma.IngredientForecastUncheckedCreateInput} suitable for `create`
   * or the `create` branch of an `upsert` call.
   *
   * Note: `created_at` is omitted; the database generates it automatically.
   *
   * @param domain - The domain entity to convert.
   * @returns The Prisma create-input payload.
   */
  static toPrisma(
    domain: IngredientForecast,
  ): Prisma.IngredientForecastUncheckedCreateInput {
    return {
      id: domain.id ?? undefined,
      ingredient_id: domain.ingredientId,
      forecast_date: domain.forecastDate,
      predicted_usage: new Prisma.Decimal(domain.predictedUsage),
      lower_bound: new Prisma.Decimal(domain.lowerBound),
      upper_bound: new Prisma.Decimal(domain.upperBound),
      confidence_level: new Prisma.Decimal(domain.confidenceLevel),
      model_version: domain.modelVersion,
    };
  }
}
