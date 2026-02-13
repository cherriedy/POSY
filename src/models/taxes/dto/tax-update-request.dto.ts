import {
  IsBoolean,
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { TaxType, TaxRateType } from '../enums';

export class UpdateTaxDto {
  @ApiPropertyOptional({ enum: TaxType, description: 'Tax type' })
  @IsOptional()
  @IsEnum(TaxType)
  type?: TaxType;

  @ApiPropertyOptional({ type: String, description: 'Tax name' })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional({ type: String, description: 'Tax display name' })
  @IsOptional()
  @IsString()
  displayName?: string;

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

  @ApiPropertyOptional({ type: Boolean, description: 'Apply after VAT' })
  @IsOptional()
  @IsBoolean()
  applyAfterVAT?: boolean;

  @ApiPropertyOptional({
    type: Number,
    description: 'Sort order for tax calculation',
  })
  @IsOptional()
  @IsNumber()
  sortOrder?: number;
}
