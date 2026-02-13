import { Transform } from 'class-transformer';
import { IsOptional, IsBoolean, IsNumber, IsString } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { FloorOrderBy, FloorQueryParams, FloorSortField } from '../interfaces';
import { SortDirection } from '../../../common/interfaces';

export class FloorQueryParamsDto {
  @ApiPropertyOptional({
    type: String,
    description: 'Search query for floor name',
    example: 'Ground',
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
    example: 'order:asc,name:asc',
    enum: [
      'name:asc',
      'name:desc',
      'order:asc',
      'order:desc',
      'createdAt:asc',
      'createdAt:desc',
      'updatedAt:asc',
      'updatedAt:desc',
    ],
  })
  @IsOptional()
  @IsString()
  orderBy?: string;

  toQueryParams(): FloorQueryParams {
    const { page, pageSize, query, isActive, orderBy } = this;

    // Parse orderBy string into FloorOrderBy array
    let parsedOrderBy: FloorOrderBy | undefined;
    if (orderBy) {
      parsedOrderBy = orderBy.split(',').map((item) => {
        const [field, direction] = item.split(':');
        return {
          field: field as FloorSortField,
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
      },
    };
  }
}
