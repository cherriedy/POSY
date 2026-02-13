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

export class CreateTaxDto {
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

  @ApiProperty({
    type: String,
    description: 'Tax display name',
    example: 'VAT 10%',
  })
  @IsString()
  @IsNotEmpty()
  displayName: string;

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
    type: Boolean,
    description: 'Apply after VAT',
    default: false,
  })
  @IsOptional()
  @IsBoolean()
  applyAfterVAT?: boolean;

  @ApiPropertyOptional({
    type: Number,
    description: 'Sort order for tax calculation',
    default: 0,
  })
  @IsOptional()
  @IsNumber()
  sortOrder?: number;
}
