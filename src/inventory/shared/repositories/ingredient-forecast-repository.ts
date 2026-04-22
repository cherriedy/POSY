import {
  IngredientForecastRepository,
  ForecastRow,
} from './ingredient-forecast-repository.abstract';
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../providers/prisma/prisma.service';
import { IngredientForecast as PrismaIngredientForecast } from '@prisma/client';

@Injectable()
export class IngredientForecastRepositoryImpl implements IngredientForecastRepository {
  constructor(private readonly prismaService: PrismaService) {}

  /**
   * Returns lightweight forecast rows (ingredient_id, predicted_usage,
   * upper_bound, forecast_date) for all ingredients on `date`.
   * Only touches the `ingredient_forecasts` table.
   */
  async findByDate(date: Date): Promise<ForecastRow[]> {
    const start = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    const end = new Date(
      date.getFullYear(),
      date.getMonth(),
      date.getDate() + 1,
    );

    console.log('start:', start);
    console.log('end:', end);

    return this.prismaService.ingredientForecast.findMany({
      where: {
        forecast_date: {
          gte: start,
          lt: end,
        },
      },
      select: {
        ingredient_id: true,
        predicted_usage: true,
        upper_bound: true,
        forecast_date: true,
      },
    });
  }

  /**
   * Returns full forecast rows for a single ingredient where
   * `forecast_date > from` and `forecast_date <= to`.
   */
  async findByIngredientAndDateRange(
    ingredientId: string,
    from: Date,
    to: Date,
  ): Promise<PrismaIngredientForecast[]> {
    return this.prismaService.ingredientForecast.findMany({
      where: {
        ingredient_id: ingredientId,
        forecast_date: { gt: from, lte: to },
      },
      orderBy: { forecast_date: 'asc' },
    });
  }
}
