import {
  Controller,
  Get,
  InternalServerErrorException,
  NotFoundException,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiInternalServerErrorResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import { plainToInstance } from 'class-transformer';
import { IngredientForecastService } from './features/ingredient-forecast.service';
import {
  ForecastChartQueryParamsDto,
  ForecastChartResponseDto,
  IngredientOverviewResponseDto,
} from './shared/dto';
import { StockStatus } from './shared/enum';
import { AuthGuard } from '@nestjs/passport';
import { RoleGuard } from '../authorization/guards/role.guard';
import { Role } from '../common/enums';
import { Roles } from '../common/decorators';
import { inventoryConfig } from './inventory.config';

@UseGuards(AuthGuard('jwt'), RoleGuard)
@Roles(Role.MANAGER, Role.ADMIN)
@ApiBearerAuth()
@ApiTags('Inventory')
@Controller('inventory/forecast')
export class InventoryController {
  constructor(
    private readonly ingredientForecastService: IngredientForecastService,
  ) {}

  @Get('overview')
  @ApiOperation({
    summary: 'Get tomorrow forecast overview',
    description:
      'Returns a real-time stock status overview for every ingredient ' +
      'that has a forecast on the target date (default: tomorrow).',
  })
  @ApiOkResponse({
    type: IngredientOverviewResponseDto,
    description: 'Overview returned successfully',
  })
  async getOverview(
    @Query('target_date') target?: string,
  ): Promise<IngredientOverviewResponseDto> {
    try {
      let targetDate: Date;
      if (!target) {
        targetDate = new Date();
        targetDate.setDate(targetDate.getDate() + 1);
        targetDate.setHours(0, 0, 0, 0);
      } else {
        targetDate = new Date(target);
        targetDate.setHours(0, 0, 0, 0);
      }

      const { targetDate: resolvedDate, overview } =
        await this.ingredientForecastService.getOverview(targetDate);

      const items = overview.map((item) => ({
        ingredient_id: item.ingredientId,
        name: item.name,
        unit: item.unit,
        current_stock: item.currentStock,
        predicted_usage: item.predictedUsage,
        upper_bound: item.upperBound,
        stock_status: item.stockStatus,
      }));

      const meta = {
        target_date: resolvedDate.toISOString().split('T')[0],
        total_ingredients: items.length,
        danger_count: items.filter((a) => {
          return a.stock_status === StockStatus.DANGER;
        }).length,
        warning_count: items.filter((a) => {
          return a.stock_status === StockStatus.WARNING;
        }).length,
      };

      return plainToInstance(IngredientOverviewResponseDto, meta, {
        excludeExtraneousValues: true,
      });
    } catch {
      throw new InternalServerErrorException('Failed to fetch overview');
    }
  }

  @Get('chart')
  @ApiOperation({
    summary: 'Get ingredient forecast chart data',
    description:
      'Returns historical usage and Prophet-model forecast series for a single ingredient.\n' +
      '- `history` — actual daily usage for the last `historyDays` days (default 14)\n' +
      '- `forecast` — predicted usage with confidence bounds for the next `forecastDays` days (default 7)\n' +
      ' - `d` = date, `y` = predicted, `l` = lower bound, `u` = upper bound',
  })
  @ApiOkResponse({
    type: ForecastChartResponseDto,
    description: 'Chart data returned successfully',
  })
  @ApiNotFoundResponse({ description: 'Ingredient not found' })
  async getIngredientForecastChart(
    @Query() query: ForecastChartQueryParamsDto,
  ): Promise<ForecastChartResponseDto> {
    try {
      const { history, forecast, ingredientInfo } =
        await this.ingredientForecastService.getIngredientForecastChart(
          query.ingredientId,
          query.historyDays,
          query.forecastDays,
        );

      return plainToInstance(
        ForecastChartResponseDto,
        {
          items: {
            ingredient_info: ingredientInfo,
            chart_data: {
              // d = date, y = quantity used
              history: history.map((h) => ({
                d: h.usageDate.toISOString().split('T')[0],
                y: h.quantityUsed,
              })),
              // d = date, y = predicted, l = lower bound, u = upper bound
              forecast: forecast.map((f) => ({
                d: f.forecast_date.toISOString().split('T')[0],
                y: Number(f.predicted_usage),
                l: Number(f.lower_bound),
                u: Number(f.upper_bound),
              })),
            },
          },
        },
        { excludeExtraneousValues: true },
      );
    } catch (e) {
      if (e instanceof NotFoundException) throw e;
      throw new InternalServerErrorException(
        'An error occurred while processing your request.',
      );
    }
  }

  @Get('trigger')
  @Roles(Role.ADMIN)
  @ApiOperation({
    summary: 'Trigger forecast recalculation',
    description:
      'Used to trigger a manual recalculation of all ingredient forecasts. ' +
      'Only available to administrators, as it can be resource-intensive.',
  })
  @ApiQuery({
    name: 'forecast_days',
    required: false,
    default: inventoryConfig.ingredient.forecast.forecastDays,
    description: 'Number of days to forecast into the future.',
  })
  @ApiOkResponse({
    description: 'Forecast recalculation triggered successfully',
  })
  @ApiInternalServerErrorResponse({
    description: 'Failed to trigger forecast recalculation',
  })
  async triggerRecalculation(@Query('forecast_days') forecastDays?: number) {
    try {
      await this.ingredientForecastService.triggerForecastUpdate(forecastDays);
      return { message: 'Forecast recalculation triggered successfully' };
    } catch {
      throw new InternalServerErrorException(
        'Failed to trigger forecast recalculation',
      );
    }
  }
}
