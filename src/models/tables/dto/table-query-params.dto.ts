import { Transform } from 'class-transformer';
import {
  IsOptional,
  IsBoolean,
  IsNumber,
  IsString,
  IsEnum,
  IsUUID,
} from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { TableOrderBy, TableQueryParams, TableSortField } from '../interfaces';
import { SortDirection } from '../../../common/interfaces';
import { TableStatus } from '../enums';

export class TableQueryParamsDto {
  @ApiPropertyOptional({
    type: String,
    description: 'Search query for table name',
    example: 'T-1',
  })
  @IsOptional()
  @IsString()
  query?: string;

  @ApiPropertyOptional({
    type: Boolean,
    description: 'Is active',
    example: true,
  })
  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => value === 'true' || value === true)
  isActive?: boolean;

  @ApiPropertyOptional({
    type: String,
    enum: TableStatus,
    description: 'Filter by table status',
    example: TableStatus.AVAILABLE,
  })
  @IsOptional()
  @IsEnum(TableStatus)
  status?: TableStatus;

  @ApiPropertyOptional({
    type: String,
    description: 'Filter by floor ID',
    example: 'f1a2b3d4-5678-90ab-cdef-1234567890ab',
  })
  @IsOptional()
  @IsUUID()
  floorId?: string;

  @ApiPropertyOptional({
    type: String,
    description: 'Filter by zone ID',
    example: 'z1a2b3d4-5678-90ab-cdef-1234567890ab',
  })
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

  @ApiPropertyOptional({
    type: String,
    description: `Order by fields in format: field:direction,field:direction.`,
    example: 'name:asc,capacity:desc',
    enum: [
      'name:asc',
      'name:desc',
      'capacity:asc',
      'capacity:desc',
      'status:asc',
      'status:desc',
      'createdAt:asc',
      'createdAt:desc',
      'updatedAt:asc',
      'updatedAt:desc',
    ],
  })
  @IsOptional()
  @IsString()
  orderBy?: string;

  toQueryParams(): TableQueryParams {
    const {
      page,
      pageSize,
      query,
      isActive,
      status,
      floorId,
      zoneId,
      orderBy,
    } = this;

    // Parse orderBy string into TableOrderBy array
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
      filter: {
        query,
        isActive,
        status,
        floorId,
        zoneId,
      },
    };
  }
}
