import { Transform, Type } from 'class-transformer';
import {
  IsOptional,
  IsBoolean,
  IsNumber,
  IsArray,
  IsEnum,
  IsString,
} from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { ProductDiscountType } from '../enums';
import {
  ProductOrderBy,
  ProductQueryParams,
  ProductSortField,
} from '../interfaces';
import { SortDirection } from '../../../common/interfaces';

/* -------------------------------------------------------------------------- */
/*                           BOOLEAN TRANSFORM HELPER                         */
/* -------------------------------------------------------------------------- */

const toBoolean = (value: any): boolean | undefined => {
  if (value === true || value === 'true') return true;
  if (value === false || value === 'false') return false;
  return undefined;
};

export class ProductQueryParamsDto {
  /* -------------------------------------------------------------------------- */
  /*                                   SEARCH                                   */
  /* -------------------------------------------------------------------------- */

  @ApiPropertyOptional({ type: String, description: 'Search query' })
  @IsOptional()
  @IsString()
  query?: string;

  /* -------------------------------------------------------------------------- */
  /*                                   PRICE                                    */
  /* -------------------------------------------------------------------------- */

  @ApiPropertyOptional({ type: Number, description: 'Minimum price' })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  priceMin?: number;

  @ApiPropertyOptional({ type: Number, description: 'Maximum price' })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  priceMax?: number;

  /* -------------------------------------------------------------------------- */
  /*                                  CATEGORY                                  */
  /* -------------------------------------------------------------------------- */

  @ApiPropertyOptional({
    type: [String],
    description: 'Category IDs (comma separated)',
    example: 'category1,category2',
  })
  @IsOptional()
  @IsArray()
  @Transform(({ value }) =>
    typeof value === 'string' ? value.split(',') : value,
  )
  @IsString({ each: true })
  categoryId?: string[];

  /* -------------------------------------------------------------------------- */
  /*                                  DISCOUNT                                  */
  /* -------------------------------------------------------------------------- */

  @ApiPropertyOptional({ enum: ProductDiscountType, description: 'Discount type' })
  @IsOptional()
  @IsEnum(ProductDiscountType)
  discountType?: ProductDiscountType;

  @ApiPropertyOptional({ type: Number, description: 'Minimum discount value' })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  discountValueMin?: number;

  @ApiPropertyOptional({ type: Number, description: 'Maximum discount value' })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  discountValueMax?: number;

  /* -------------------------------------------------------------------------- */
  /*                                   STOCK                                    */
  /* -------------------------------------------------------------------------- */

  @ApiPropertyOptional({ type: Number, description: 'Minimum stock quantity' })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  stockQuantityMin?: number;

  @ApiPropertyOptional({ type: Number, description: 'Maximum stock quantity' })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  stockQuantityMax?: number;

  /* -------------------------------------------------------------------------- */
  /*                                  BOOLEAN                                   */
  /* -------------------------------------------------------------------------- */

  @ApiPropertyOptional({ type: Boolean, description: 'Is available' })
  @IsOptional()
  @Transform(({ value }) => toBoolean(value))
  @IsBoolean()
  isAvailable?: boolean;

  @ApiPropertyOptional({ type: Boolean, description: 'Is deleted' })
  @IsOptional()
  @Transform(({ value }) => toBoolean(value))
  @IsBoolean()
  isDeleted?: boolean;

  /* -------------------------------------------------------------------------- */
  /*                                 PAGINATION                                 */
  /* -------------------------------------------------------------------------- */

  @ApiPropertyOptional({ type: Number, description: 'Page number' })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  page?: number;

  @ApiPropertyOptional({ type: Number, description: 'Page size' })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  pageSize?: number;

  /* -------------------------------------------------------------------------- */
  /*                                  SORTING                                   */
  /* -------------------------------------------------------------------------- */

  @ApiPropertyOptional({
    type: String,
    description:
      'Order by fields in format: field:direction,field:direction',
    example: 'price:asc,stockQuantity:desc',
  })
  @IsOptional()
  @IsString()
  orderBy?: string;

  /* -------------------------------------------------------------------------- */
  /*                               MAPPER METHOD                                */
  /* -------------------------------------------------------------------------- */

  toQueryParams(): ProductQueryParams {
    const { page, pageSize, orderBy, ...filter } = this;

    let parsedOrderBy: ProductOrderBy | undefined;

    if (orderBy) {
      parsedOrderBy = orderBy
        .split(',')
        .map((item) => {
          const [field, direction] = item.split(':');
          if (!field || !direction) return undefined;

          return {
            field: field as ProductSortField,
            direction: direction as SortDirection,
          };
        })
        .filter(Boolean) as ProductOrderBy;
    }

    return {
      page,
      pageSize,
      orderBy: parsedOrderBy,
      filter,
    };
  }
}