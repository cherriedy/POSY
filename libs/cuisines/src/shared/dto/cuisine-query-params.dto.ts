import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsNumber, IsOptional, IsString } from 'class-validator';
import {
  CuisineOrderBy,
  CuisineQueryParams,
  CuisineSortField,
} from '../interfaces/cuisine-query-params.interface';
import { SortDirection } from '@posy/shared';
import { Transform } from 'class-transformer';

export class CuisineQueryParamsDto {
  @ApiPropertyOptional({
    description: 'Search query for cuisine name or region',
    example: 'Vietnamese',
    nullable: true,
    default: null,
  })
  @IsOptional()
  @IsString()
  query: string | null = null;

  @ApiPropertyOptional({
    description: 'Whether to include deleted cuisines',
    example: false,
    nullable: true,
    default: false,
  })
  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => value === 'true' || value === true)
  isDeleted: boolean | null = false;

  @ApiPropertyOptional({
    description: 'Page number (1-indexed)',
    example: 1,
    nullable: true,
    default: null,
  })
  @IsOptional()
  @IsNumber()
  @Transform(({ value }) => parseInt(value as string))
  page: number | null = null;

  @ApiPropertyOptional({
    description: 'Page size',
    example: 10,
    nullable: true,
    default: null,
  })
  @IsOptional()
  @IsNumber()
  @Transform(({ value }) => parseInt(value as string))
  pageSize: number | null = null;

  @ApiPropertyOptional({
    type: String,
    description: `Order by fields in format: field:direction,field:direction.`,
    example: 'name:asc,createdAt:desc',
    nullable: true,
    default: null,
  })
  @IsOptional()
  @IsString()
  orderBy: string | null = null;

  toQueryParams(): CuisineQueryParams {
    const { page, pageSize, query, isDeleted, orderBy } = this;

    let parsedOrderBy: CuisineOrderBy | null = null;
    if (orderBy) {
      parsedOrderBy = orderBy.split(',').map((item) => {
        const [field, direction] = item.split(':');
        return {
          field: field as CuisineSortField,
          direction: direction as SortDirection,
        };
      });
    }

    return {
      page: page ?? undefined,
      pageSize: pageSize ?? undefined,
      orderBy: parsedOrderBy,
      filter: { query, isDeleted },
    };
  }
}
