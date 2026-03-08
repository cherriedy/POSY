import { Transform } from 'class-transformer';
import { IsOptional, IsNumber, IsString, IsUUID } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IngredientOrderBy,
  IngredientQueryParams,
  IngredientSortField,
} from '../interfaces';
import { SortDirection } from '../../../common/interfaces';

export class IngredientQueryParamsDto {
  @ApiPropertyOptional({
    type: Number,
    description: 'Page number',
    example: 1,
  })
  @IsOptional()
  @IsNumber()
  @Transform(({ value }) => parseInt(value as string))
  page?: number;

  @ApiPropertyOptional({
    type: Number,
    description: 'Page size',
    example: 10,
  })
  @IsOptional()
  @IsNumber()
  @Transform(({ value }) => parseInt(value as string))
  pageSize?: number;

  @ApiPropertyOptional({
    type: String,
    description: 'Filter by vendor ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsOptional()
  @IsUUID()
  vendorId?: string;

  @ApiPropertyOptional({
    type: String,
    description: 'Filter by unit ID',
    example: '123e4567-e89b-12d3-a456-426614174001',
  })
  @IsOptional()
  @IsUUID()
  unitId?: string;

  @ApiPropertyOptional({
    type: String,
    description: 'Search ingredient name',
    example: 'Tomato',
  })
  @IsOptional()
  @IsString()
  query?: string;

  @ApiPropertyOptional({
    type: String,
    description: `Order by fields in format: field:direction,field:direction.
    Available fields: name, stock, minStock, unitCost, expiredAt, createdAt, updatedAt`,
    example: 'name:asc,createdAt:desc',
  })
  @IsOptional()
  @IsString()
  orderBy?: string;

  toQueryParams(): IngredientQueryParams {
    const { page, pageSize, vendorId, unitId, query, orderBy } = this;

    let parsedOrderBy: IngredientOrderBy | undefined;
    if (orderBy) {
      parsedOrderBy = orderBy.split(',').map((item) => {
        const [field, direction] = item.split(':');
        return {
          field: field as IngredientSortField,
          direction: direction as SortDirection,
        };
      });
    }

    return {
      page,
      pageSize,
      orderBy: parsedOrderBy,
      filter: {
        vendorId,
        unitId,
        query,
      },
    };
  }
}
