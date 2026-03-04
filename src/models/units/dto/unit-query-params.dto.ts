import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import { IsBoolean, IsInt, IsOptional, IsString, Min } from 'class-validator';
import { SortDirection } from '../../../common/interfaces';
import { UnitOrderBy, UnitQueryParams, UnitSortField } from '../interfaces';

export class UnitQueryParamsDto {
  @ApiPropertyOptional({
    type: Number,
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
    type: Number,
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
    type: String,
    description: 'Search query for unit name or abbreviation',
    example: 'kg',
    nullable: true,
  })
  @IsOptional()
  @IsString()
  query?: string;

  @ApiPropertyOptional({
    type: Boolean,
    description: 'Filter only deleted units',
    example: false,
    default: false,
    nullable: true,
  })
  @IsOptional()
  @Transform(({ value }) => value === 'true' || value === true)
  @IsBoolean()
  isDeleted?: boolean;

  @ApiPropertyOptional({
    type: String,
    description: `Order by fields in format: field:direction,field:direction.
    Available fields: name, abbreviation, createdAt, updatedAt`,
    example: 'name:asc',
    nullable: true,
  })
  @IsOptional()
  @IsString()
  orderBy?: string;

  toQueryParams(): UnitQueryParams {
    const { page, pageSize, query, isDeleted, orderBy } = this;

    let parsedOrderBy: UnitOrderBy | undefined;
    if (orderBy) {
      parsedOrderBy = orderBy.split(',').map((item) => {
        const [field, direction] = item.split(':');
        return {
          field: field as UnitSortField,
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
        isDeleted,
      },
    };
  }
}
