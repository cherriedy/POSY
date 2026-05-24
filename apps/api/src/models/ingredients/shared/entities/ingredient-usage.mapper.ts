import { IngredientUsage } from './ingredient-usage';
import {
  IngredientUsage as PrismaIngredientUsage,
  Prisma,
} from '@prisma/client';

export class IngredientUsageMapper {
  /**
   * Converts a Prisma {@link PrismaIngredientUsage} row into a domain
   * {@link IngredientUsage} instance.
   *
   * `Decimal` fields are coerced to `number` via `Number()` so that the
   * domain layer never deals with Prisma-specific types.
   *
   * @param prisma - The raw Prisma row returned from the database.
   * @returns A hydrated {@link IngredientUsage} domain entity.
   */
  static toDomain(this: void, prisma: PrismaIngredientUsage): IngredientUsage {
    return new IngredientUsage(
      prisma.id,
      prisma.ingredient_id,
      prisma.usage_date,
      Number(prisma.quantity_used),
      prisma.order_count,
      prisma.day_of_week,
      prisma.hour_of_day,
      prisma.is_weekend,
      prisma.is_holiday,
      prisma.created_at,
    );
  }

  /**
   * Converts a domain {@link IngredientUsage} entity into a Prisma
   * {@link Prisma.IngredientUsageUncheckedCreateInput} suitable for `create`
   * or the `create` branch of an `upsert` call.
   *
   * Note: `id` and `created_at` are omitted; the database generates them.
   *
   * @param domain - The domain entity to convert.
   * @returns The Prisma create-input payload.
   */
  static toPrisma(
    domain: IngredientUsage,
  ): Prisma.IngredientUsageUncheckedCreateInput {
    return {
      ingredient_id: domain.ingredientId,
      usage_date: domain.usageDate,
      quantity_used: new Prisma.Decimal(domain.quantityUsed),
      order_count: domain.orderCount,
      day_of_week: domain.dayOfWeek,
      hour_of_day: domain.hourOfDay,
      is_weekend: domain.isWeekend,
      is_holiday: domain.isHoliday,
    };
  }
}
