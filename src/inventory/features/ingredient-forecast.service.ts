import { Inject, Injectable, LoggerService } from '@nestjs/common';
import { IngredientNotFoundException } from '../../models/ingredients';
import { IngredientRepository } from '../../models/ingredients/shared/repositories';
import { IngredientUsageRepository } from '../../models/ingredients/shared/repositories';
import { IngredientForecastRepository } from '../shared/repositories/ingredient-forecast-repository.abstract';
import { IngredientOverview } from '../shared/entities';
import { HttpService } from '@nestjs/axios';
import { PythonConfigService } from '../../config/python/config.service';
import { Cron, CronExpression } from '@nestjs/schedule';
import { inventoryConfig } from '../inventory.config';
import { lastValueFrom } from 'rxjs';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';

@Injectable()
export class IngredientForecastService {
  @Inject(WINSTON_MODULE_NEST_PROVIDER)
  private readonly logger: LoggerService;

  private readonly baseUrl: string;
  private readonly defaultForecastDays: number;

  constructor(
    pythonConfigService: PythonConfigService,
    private readonly httpService: HttpService,
    private readonly ingredientForecastRepository: IngredientForecastRepository,
    private readonly ingredientRepository: IngredientRepository,
    private readonly ingredientUsageRepository: IngredientUsageRepository,
  ) {
    this.baseUrl = pythonConfigService.url;

    const { forecastDays } = inventoryConfig.ingredient.forecast;
    this.defaultForecastDays = forecastDays;
  }

  /**
   * Fetches all data required to build the forecast chart for a single ingredient.
   *
   * Runs 3 queries in parallel, each delegated to its own repository:
   *  - historical usage    → IngredientUsageRepository
   *  - forecast records    → IngredientForecastRepository
   *  - ingredient metadata → IngredientRepository
   *
   * @throws {IngredientNotFoundException} when no ingredient matches `ingredientId`.
   */
  async getIngredientForecastChart(
    ingredientId: string,
    historyDays = 14,
    forecastDays = 7,
  ) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const pastDate = new Date(today);
    pastDate.setDate(today.getDate() - historyDays);

    const futureDate = new Date(today);
    futureDate.setDate(today.getDate() + forecastDays);

    const [history, forecast, ingredientInfo] = await Promise.all([
      this.ingredientUsageRepository.findByIngredientIdAndDateRange(
        ingredientId,
        pastDate,
        today,
      ),
      this.ingredientForecastRepository.findByIngredientAndDateRange(
        ingredientId,
        today,
        futureDate,
      ),
      this.ingredientRepository.findById(ingredientId),
    ]);

    if (!ingredientInfo) throw new IngredientNotFoundException(ingredientId);

    return { history, forecast, ingredientInfo };
  }

  /**
   * Fetches the forecast overview for the given target date.
   *
   * 1. Loads forecast rows for the date           → IngredientForecastRepository
   * 2. Loads stock + unit info for those IDs      → IngredientRepository
   * 3. Combines them into IngredientOverview[]    (business logic lives here)
   */
  async getOverview(targetDate: Date): Promise<{
    targetDate: Date;
    overview: IngredientOverview[];
  }> {
    // Step 1 — fetch forecast rows (ingredient_forecasts table only)
    const forecasts =
      await this.ingredientForecastRepository.findByDate(targetDate);

    if (forecasts.length === 0) {
      return { targetDate, overview: [] };
    }

    // Step 2 — fetch ingredient info for the forecasted IDs (ingredients table only)
    const ingredientIds = forecasts.map((f) => f.ingredient_id);
    const ingredients =
      await this.ingredientRepository.findByIds(ingredientIds);

    // Step 3 — combine into domain objects, skip any orphaned forecast rows
    const ingredientMap = new Map(ingredients.map((i) => [i.id!, i]));

    const overview = forecasts
      .map((f) => {
        const ingredient = ingredientMap.get(f.ingredient_id);
        if (!ingredient) return null;

        const currentStock = ingredient.stock;
        const predictedUsage = Number(f.predicted_usage);
        const upperBound = Number(f.upper_bound);

        return new IngredientOverview(
          f.ingredient_id,
          ingredient.name,
          ingredient.unit?.abbreviation ?? '',
          currentStock,
          predictedUsage,
          upperBound,
          f.forecast_date,
          IngredientOverview.computeStockStatus(
            currentStock,
            predictedUsage,
            upperBound,
          ),
        );
      })
      .filter((item): item is IngredientOverview => item !== null);

    return { targetDate, overview };
  }

  /**
   * Public method to trigger the forecast update process on demand.
   *
   * @param forecastDays Number of days to forecast into the future
   * @throws Will log an error if the HTTP request fails, but will not rethrow to prevent blocking callers
   */
  async triggerForecastUpdate(forecastDays = this.defaultForecastDays) {
    await this.handleDailyForecastUpdate(forecastDays);
  }

  /**
   * Scheduled job that runs every day at 3 AM to trigger the ingredient forecast update process.
   *
   * This method sends a POST request to the external Python service's `/api/forecast/update`
   * endpoint, passing the default number of forecast days as a parameter. The Python service
   * is responsible for recalculating the ingredient forecasts based on the latest data and
   * updating the database accordingly.
   *
   * @throw Will log an error if the HTTP request fails, but will not rethrow to prevent scheduler crashes
   * or blocking other scheduled tasks.
   */
  @Cron(CronExpression.EVERY_DAY_AT_3AM)
  private async handleDailyForecastUpdate(
    forecastDays = this.defaultForecastDays,
  ) {
    this.logger.log('Starting daily ingredient forecast update job');
    try {
      const url = `${this.baseUrl}/api/forecast/ingredients`;
      const requestBody = { forecast_days: forecastDays };
      const response = await lastValueFrom(
        this.httpService.post(url, requestBody),
      );
      if (response.status === 200) {
        this.logger.log('Successfully completed ingredient forecast update');
      } else {
        this.logger.error(
          `Failed to update ingredient forecast: ${response.statusText}`,
        );
      }
    } catch (e) {
      this.logger.error(
        'Failed to complete ingredient forecast update',
        e instanceof Error ? e.stack : null,
      );
    }
  }
}
