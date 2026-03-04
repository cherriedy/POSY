import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsOptional,
  IsString,
  IsBoolean,
  IsInt,
  Min,
  IsEnum,
} from 'class-validator';
import { Type, Transform } from 'class-transformer';
import {
  VendorQueryParams,
  VendorOrderBy,
  VendorQueryFilter,
  VendorSortField,
} from '../interfaces';
import { VendorStatus } from '../enums';
import { SortDirection } from '../../../common/interfaces';

export class VendorQueryParamsDto {
  @ApiPropertyOptional({
    description: 'Page number',
    example: 1,
    default: 1,
    nullable: true,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number;

  @ApiPropertyOptional({
    description: 'Number of items per page',
    example: 20,
    default: 20,
    nullable: true,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  pageSize?: number;

  @ApiPropertyOptional({
    description: 'Search query for vendor name, contact, or address',
    example: 'Fresh Farms',
    nullable: true,
  })
  @IsOptional()
  @IsString()
  query?: string;

  @ApiPropertyOptional({
    description: 'Filter by vendor status',
    example: VendorStatus.ACTIVE,
    enum: VendorStatus,
    nullable: true,
  })
  @IsOptional()
  @IsEnum(VendorStatus)
  status?: VendorStatus;

  @ApiPropertyOptional({
    description: 'Filter only deleted vendors',
    example: false,
    default: false,
    nullable: true,
  })
  @IsOptional()
  @Transform(({ value }) => value === 'true' || value === true)
  @IsBoolean()
  isDeleted?: boolean;

  @ApiPropertyOptional({
    description: 'Filter only suspended vendors',
    example: false,
    default: false,
    nullable: true,
  })
  @IsOptional()
  @Transform(({ value }) => value === 'true' || value === true)
  @IsBoolean()
  isSuspended?: boolean;

  @ApiPropertyOptional({
    description: 'Sort by field and direction (e.g., name:asc,createdAt:desc)',
    example: 'name:asc',
    nullable: true,
  })
  @IsOptional()
  @IsString()
  orderBy?: string;

  /**
   * Converts the DTO to VendorQueryParams interface.
   */
  toQueryParams(): VendorQueryParams {
    const filter: VendorQueryFilter = {};
    if (this.query) filter.query = this.query;
    if (this.status) filter.status = this.status;
    if (this.isDeleted) filter.isDeleted = this.isDeleted;
    if (this.isSuspended) filter.isSuspended = this.isSuspended;

    const orderBy: VendorOrderBy = this.orderBy
      ? this.orderBy.split(',').map((item) => {
          const [field, direction] = item.split(':');
          return {
            field: field as VendorSortField,
            direction: direction as SortDirection,
          };
        })
      : [];

    return {
      page: this.page,
      pageSize: this.pageSize,
      filter: Object.keys(filter).length > 0 ? filter : undefined,
      orderBy: orderBy.length > 0 ? orderBy : undefined,
    };
  }
}
