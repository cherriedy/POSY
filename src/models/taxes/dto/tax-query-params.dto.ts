import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsBoolean,
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';
import { Transform, Type } from 'class-transformer';
import { TaxType, TaxRateType } from '../enums';
import { TaxOrderBy, TaxQueryParams, TaxSortField } from '../interfaces';
import { SortDirection } from '../../../common/interfaces';

export class TaxQueryParamsDto {
  @ApiPropertyOptional({ type: Number, description: 'Page number', default: 1 })
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  page?: number;

  @ApiPropertyOptional({
    type: Number,
    description: 'Page size',
    default: 10,
  })
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  pageSize?: number;

  @ApiPropertyOptional({
    type: String,
    description: 'Search by name or display name',
  })
  @IsOptional()
  @IsString()
  query?: string;

  @ApiPropertyOptional({ enum: TaxType, description: 'Filter by tax type' })
  @IsOptional()
  @IsEnum(TaxType)
  type?: TaxType;

  @ApiPropertyOptional({
    enum: TaxRateType,
    description: 'Filter by rate type',
  })
  @IsOptional()
  @IsEnum(TaxRateType)
  rateType?: TaxRateType;

  @ApiPropertyOptional({
    type: Boolean,
    description: 'Filter by active status',
  })
  @IsOptional()
  @IsBoolean()
  @Type(() => Boolean)
  isActive?: boolean;

  @ApiPropertyOptional({
    type: Boolean,
    description: 'Filter by included status',
  })
  @IsOptional()
  @IsBoolean()
  @Type(() => Boolean)
  isIncluded?: boolean;

  @ApiPropertyOptional({
    type: Boolean,
    description: 'Include deleted taxes',
    default: false,
  })
  @IsOptional()
  @IsBoolean()
  @Type(() => Boolean)
  includeDeleted?: boolean;

  @ApiPropertyOptional({
    type: String,
    description: `Order by fields in the format field:direction, separated by commas.
    Example: 'rateType:asc,name:desc'
    `,
    enum: [
      'rateType:asc',
      'rateType:desc',
      'name:asc',
      'name:desc',
      'sortOrder:asc',
      'sortOrder:desc',
      'createdAt:asc',
      'createdAt:desc',
      'updatedAt:asc',
      'updatedAt:desc',
    ],
  })
  @IsOptional()
  // @IsString()
  @Transform(({ value }) => {
    if (typeof value !== 'string') {
      return undefined;
    }
    return value.split(',').map((item: string) => {
      const [field, direction] = item.split(':');
      return {
        field: field as TaxSortField,
        direction: direction as SortDirection,
      };
    });
  })
  orderBy?: TaxOrderBy;

  toQueryParams(): TaxQueryParams {
    return {
      page: this.page,
      pageSize: this.pageSize,
      filter: {
        query: this.query,
        type: this.type ? [this.type] : undefined,
        rateType: this.rateType ? [this.rateType] : undefined,
        isActive: this.isActive,
        isIncluded: this.isIncluded,
        isDeleted: this.includeDeleted,
      },
      orderBy: this.orderBy,
    };
  }
}
