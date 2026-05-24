import { Transform } from 'class-transformer';
import { IsOptional, IsBoolean, IsNumber, IsString, IsEnum, IsUUID } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { TableOrderBy, TableQueryParams, TableSortField } from '../interfaces/table-query-params.interface';
import { SortDirection } from '@posy/shared';
import { TableStatus } from '../enums/table-status.enum';

export class TableQueryParamsDto {
  @ApiPropertyOptional({ type: String, description: 'Search query', example: 'T-1' })
  @IsOptional()
  @IsString()
  query?: string;

  @ApiPropertyOptional({ type: Boolean, description: 'Is active', example: true })
  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => value === 'true' || value === true)
  isActive?: boolean;

  @ApiPropertyOptional({ type: String, enum: TableStatus, description: 'Filter by status' })
  @IsOptional()
  @IsEnum(TableStatus)
  status?: TableStatus;

  @ApiPropertyOptional({ type: String, description: 'Filter by zone ID' })
  @IsOptional()
  @IsUUID()
  zoneId?: string;

  @ApiPropertyOptional({ type: Number, description: 'Page number', example: 1 })
  @IsOptional()
  @IsNumber()
  @Transform(({ value }) => parseInt(value as string))
  page?: number;

  @ApiPropertyOptional({ type: Number, description: 'Page size', example: 20 })
  @IsOptional()
  @IsNumber()
  @Transform(({ value }) => parseInt(value as string))
  pageSize?: number;

  @ApiPropertyOptional({ type: String, description: 'Order by fields', example: 'name:asc,capacity:desc' })
  @IsOptional()
  @IsString()
  orderBy?: string;

  toQueryParams(): TableQueryParams {
    const { page, pageSize, query, isActive, status, zoneId, orderBy } = this;

    let parsedOrderBy: TableOrderBy | undefined;
    if (orderBy) {
      parsedOrderBy = orderBy.split(',').map((item) => {
        const [field, direction] = item.split(':');
        return {
          field: field as TableSortField,
          direction: direction as SortDirection,
        };
      });
    }

    return {
      page,
      pageSize,
      orderBy: parsedOrderBy,
      filter: { query, isActive, status, zoneId },
    };
  }
}
