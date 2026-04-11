import { IngredientUsage } from '@prisma/client';

export abstract class IngredientUsageRepository {
  /**
   * Returns all usage records for a given ingredient between `from` and `to`
   * (both boundaries inclusive), ordered by date ascending.
   */
  abstract findByIngredientAndDateRange(
    ingredientId: string,
    from: Date,
    to: Date,
  ): Promise<IngredientUsage[]>;
}
