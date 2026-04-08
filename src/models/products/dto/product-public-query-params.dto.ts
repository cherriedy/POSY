import { Transform } from 'class-transformer';
import {
  IsArray,
  IsEnum,
  IsNumber,
  IsOptional,
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

/**
 * DTO for public product listing query parameters.
 *
 * Internal fields such as `isDeleted`, `isAvailable`, `stockQuantityMin`, and `stockQuantityMax` are intentionally
 * excluded. The service layer enforces `isDeleted = false` and `isAvailable = true` for all requests, ensuring
 * only available and non-deleted products are returned. This keeps the Prisma `where` clause minimal and secure.
 */
export class ProductPublicQueryParamsDto {
  @ApiPropertyOptional({
    type: String,
    description: 'Search by product name or description',
  })
  @IsOptional()
  @IsString()
  query?: string;

  @ApiPropertyOptional({ type: Number, description: 'Minimum price filter' })
  @IsOptional()
  @IsNumber()
  @Transform(({ value }) => parseFloat(value as string))
  priceMin?: number;

  @ApiPropertyOptional({ type: Number, description: 'Maximum price filter' })
  @IsOptional()
  @IsNumber()
  @Transform(({ value }) => parseFloat(value as string))
  priceMax?: number;

  @ApiPropertyOptional({
    type: [String],
    description: 'Comma-separated category IDs to filter by',
    example: 'id1,id2,id3',
  })
  @IsOptional()
  @IsArray()
  @Transform(({ value }) =>
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    typeof value === 'string' ? value.split(',') : value,
  )
  @IsString({ each: true })
  categoryId?: string[];

  @ApiPropertyOptional({
    type: String,
    enum: ProductDiscountType,
    description: 'Filter by discount type',
  })
  @IsOptional()
  @IsEnum(ProductDiscountType)
  discountType?: ProductDiscountType;

  @ApiPropertyOptional({ type: Number, description: 'Minimum discount value' })
  @IsOptional()
  @IsNumber()
  @Transform(({ value }) => parseFloat(value as string))
  discountValueMin?: number;

  @ApiPropertyOptional({ type: Number, description: 'Maximum discount value' })
  @IsOptional()
  @IsNumber()
  @Transform(({ value }) => parseFloat(value as string))
  discountValueMax?: number;

  @ApiPropertyOptional({
    type: Number,
    description: 'Page number (default: 1)',
  })
  @IsOptional()
  @IsNumber()
  @Transform(({ value }) => parseInt(value as string))
  page?: number;

  @ApiPropertyOptional({
    type: Number,
    description: 'Number of items per page (default: 20)',
  })
  @IsOptional()
  @IsNumber()
  @Transform(({ value }) => parseInt(value as string))
  pageSize?: number;

  @ApiPropertyOptional({
    type: String,
    description:
      'Sort order as comma-separated `field:direction` pairs. ' +
      'Available fields: price, name, createdAt',
    example: 'price:asc,name:desc',
  })
  @IsOptional()
  @IsString()
  orderBy?: string;

  /**
   * Converts the DTO into a {@link ProductQueryParams} object.
   * Always locks `isDeleted = false` and `isAvailable = true`
   * so deleted / unavailable products never leak to public callers.
   */
  toQueryParams(): ProductQueryParams {
    const {
      page,
      pageSize,
      query,
      priceMin,
      priceMax,
      categoryId,
      discountType,
      discountValueMin,
      discountValueMax,
      orderBy,
    } = this;

    let parsedOrderBy: ProductOrderBy | undefined;
    if (orderBy) {
      parsedOrderBy = orderBy.split(',').map((item) => {
        const [field, direction] = item.split(':');
        return {
          field: field as ProductSortField,
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
        priceMin,
        priceMax,
        categoryId,
        discountType,
        discountValueMin,
        discountValueMax,
        // Always enforce public-safe constraints, never exposed as query params
        isDeleted: false,
        isAvailable: true,
      },
    };
  }
}
