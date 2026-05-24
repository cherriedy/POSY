import { ApiProperty } from '@nestjs/swagger';
import { Exclude, Expose, Type } from 'class-transformer';

@Exclude()
class ForecastChartUnitDto {
  @ApiProperty({ type: String, description: 'Unit name', example: 'kilogram' })
  @Expose()
  name: string;

  @ApiProperty({
    type: String,
    description: 'Unit abbreviation',
    example: 'kg',
  })
  @Expose()
  abbreviation: string;
}

@Exclude()
class ForecastChartIngredientInfoDto {
  @ApiProperty({
    type: String,
    description: 'Ingredient ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @Expose()
  id: string;

  @ApiProperty({
    type: String,
    description: 'Ingredient name',
    example: 'Thịt bò Kobe',
  })
  @Expose()
  name: string;

  @ApiProperty({
    type: Number,
    description: 'Current stock level',
    example: 12,
  })
  @Expose()
  stock: number;

  @ApiProperty({
    type: () => ForecastChartUnitDto,
    description: 'Unit of measurement',
  })
  @Expose()
  @Type(() => ForecastChartUnitDto)
  unit: ForecastChartUnitDto;
}

// ─── Historical usage data point ─────────────────────────────────────────────
@Exclude()
class ForecastChartHistoryPointDto {
  @ApiProperty({
    type: String,
    description: 'Date (YYYY-MM-DD)',
    example: '2026-03-27',
  })
  @Expose()
  d: string;

  @ApiProperty({
    type: Number,
    description: 'Actual quantity used',
    example: 8.5,
  })
  @Expose()
  y: number;
}

@Exclude()
class ForecastChartForecastPointDto {
  @ApiProperty({
    type: String,
    description: 'Date (YYYY-MM-DD)',
    example: '2026-04-11',
  })
  @Expose()
  d: string;

  @ApiProperty({
    type: Number,
    description: 'Predicted usage (centre of interval)',
    example: 10.0,
  })
  @Expose()
  y: number;

  @ApiProperty({
    type: Number,
    description: 'Lower confidence-interval bound',
    example: 7.5,
  })
  @Expose()
  l: number;

  @ApiProperty({
    type: Number,
    description: 'Upper confidence-interval bound',
    example: 13.0,
  })
  @Expose()
  u: number;
}

@Exclude()
class ForecastChartDataDto {
  @ApiProperty({
    type: () => [ForecastChartHistoryPointDto],
    description: 'Historical usage points ordered by date ascending',
  })
  @Expose()
  @Type(() => ForecastChartHistoryPointDto)
  history: ForecastChartHistoryPointDto[];

  @ApiProperty({
    type: () => [ForecastChartForecastPointDto],
    description: 'Forecast points ordered by date ascending',
  })
  @Expose()
  @Type(() => ForecastChartForecastPointDto)
  forecast: ForecastChartForecastPointDto[];
}

@Exclude()
class ForecastChartDataEnvelopeDto {
  @ApiProperty({
    type: () => ForecastChartIngredientInfoDto,
    description: 'Ingredient metadata',
  })
  @Expose()
  @Type(() => ForecastChartIngredientInfoDto)
  ingredient_info: ForecastChartIngredientInfoDto;

  @ApiProperty({
    type: () => ForecastChartDataDto,
    description: 'Chart series data',
  })
  @Expose()
  @Type(() => ForecastChartDataDto)
  chart_data: ForecastChartDataDto;
}

@Exclude()
export class ForecastChartResponseDto {
  @ApiProperty({
    type: () => ForecastChartDataEnvelopeDto,
    description: 'Response payload',
  })
  @Expose()
  @Type(() => ForecastChartDataEnvelopeDto)
  items: ForecastChartDataEnvelopeDto;
}
