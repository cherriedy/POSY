import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';
import {
  CuisineOrderBy,
  CuisineQueryParams,
  CuisineSortField,
} from '../interfaces';
import { SortDirection } from '../../../common/interfaces';

/**
 * Query parameters for filtering cuisines.
 *
 * All properties are optional and default to null if not provided.
 */
export class CuisineQueryParamsDto {
  @ApiPropertyOptional({
    description: 'Search query for cuisine name or region',
    example: 'Vietnamese',
    nullable: true,
    default: null,
  })
  @IsOptional()
  @IsString()
  q: string | null = null;

  @ApiPropertyOptional({
    description: 'Whether to include deleted cuisines',
    example: false,
    nullable: true,
    default: false,
  })
  @IsOptional()
  isDeleted: boolean | null = false;

  @ApiPropertyOptional({
    description: 'Page number (1-indexed)',
    example: 1,
    nullable: true,
    default: null,
  })
  @IsOptional()
  page: number | null = null;

  @ApiPropertyOptional({
    description: 'Page size',
    example: 10,
    nullable: true,
    default: null,
  })
  @IsOptional()
  pageSize: number | null = null;

  @ApiPropertyOptional({
    type: String,
    description: `Order by fields in format: field:direction,field:direction.`,
    example: 'name:asc,createdAt:desc',
    nullable: true,
    default: null,
    enum: [
      'name:asc',
      'name:desc',
      'region:asc',
      'region:desc',
      'createdAt:asc',
      'createdAt:desc',
      'updatedAt:asc',
      'updatedAt:desc',
    ],
  })
  @IsOptional()
  @IsString()
  orderBy: string | null = null;

  toQueryParams(): CuisineQueryParams {
    const { page, pageSize, q, isDeleted, orderBy } = this;

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
      filter: { q, isDeleted },
    };
  }
}
