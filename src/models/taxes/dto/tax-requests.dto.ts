import {
  IsBoolean,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { TaxType, TaxRateType } from '../enums';

/**
 * Represents the request payload for creating a new tax configuration, including all necessary fields and validation rules.
 */
export class TaxCreateRequestDto {
  @ApiPropertyOptional({
    type: String,
    description: 'Tax ID (optional, usually auto-generated)',
  })
  @IsOptional()
  @IsString()
  id?: string;

  @ApiProperty({ enum: TaxType, description: 'Tax type', example: 'VAT' })
  @IsEnum(TaxType)
  @IsNotEmpty()
  type: TaxType;

  @ApiProperty({
    type: String,
    description: 'Tax name (unique identifier)',
    example: 'vat_10',
  })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiPropertyOptional({
    type: String,
    description: 'Tax description',
    example: 'Value Added Tax at 10%',
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({
    enum: TaxRateType,
    description: 'Rate type',
    example: 'PERCENTAGE',
  })
  @IsEnum(TaxRateType)
  @IsNotEmpty()
  rateType: TaxRateType;

  @ApiProperty({
    type: Number,
    description: 'Charge rate (e.g., 10 for 10%, or fixed amount)',
    example: 10,
  })
  @IsNumber()
  @Min(0)
  chargeRate: number;

  @ApiPropertyOptional({
    type: Boolean,
    description: 'Is tax active',
    default: true,
  })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @ApiPropertyOptional({
    type: Boolean,
    description: 'Is tax included in product price',
    default: false,
  })
  @IsOptional()
  @IsBoolean()
  isIncluded?: boolean;

  @ApiPropertyOptional({
    type: Number,
    description: 'Sort order for tax calculation',
    default: 0,
  })
  @IsOptional()
  @IsNumber()
  sortOrder?: number;
}

/**
 * Represents the request payload for updating an existing tax configuration. All fields are optional to allow partial updates.
 */
export class TaxUpdateRequestDto {
  @ApiPropertyOptional({ enum: TaxType, description: 'Tax type' })
  @IsOptional()
  @IsEnum(TaxType)
  type?: TaxType;

  @ApiPropertyOptional({ type: String, description: 'Tax name' })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional({ type: String, description: 'Tax description' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ enum: TaxRateType, description: 'Rate type' })
  @IsOptional()
  @IsEnum(TaxRateType)
  rateType?: TaxRateType;

  @ApiPropertyOptional({ type: Number, description: 'Charge rate' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  chargeRate?: number;

  @ApiPropertyOptional({ type: Boolean, description: 'Is tax active' })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @ApiPropertyOptional({
    type: Boolean,
    description: 'Is tax included in product price',
  })
  @IsOptional()
  @IsBoolean()
  isIncluded?: boolean;

  @ApiPropertyOptional({
    type: Number,
    description: 'Sort order for tax calculation',
  })
  @IsOptional()
  @IsNumber()
  sortOrder?: number;
}
