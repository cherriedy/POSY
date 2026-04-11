import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsInt, IsUUID, IsOptional, Max, Min } from 'class-validator';

export class ForecastChartQueryParamsDto {
  @ApiProperty({
    type: String,
    format: 'uuid',
    description: 'Ingredient ID to chart',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsUUID('4')
  ingredientId: string;

  @ApiPropertyOptional({
    type: Number,
    description: 'Number of historical days to include (default: 14, max: 90)',
    example: 14,
    default: 14,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(90)
  historyDays?: number;

  @ApiPropertyOptional({
    type: Number,
    description: 'Number of forecast days to include (default: 7, max: 30)',
    example: 7,
    default: 7,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(30)
  forecastDays?: number;
}
