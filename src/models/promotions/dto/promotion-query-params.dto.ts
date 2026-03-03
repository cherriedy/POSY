import { Transform, Type } from 'class-transformer';
import {
  IsOptional,
  IsBoolean,
  IsNumber,
  IsArray,
  IsEnum,
  IsString,
  IsDate,
} from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  PromotionApplicability,
  PromotionDiscountType,
  PromotionStatus,
} from '../enums';
import { PromotionQueryParams } from '../interfaces';

/* -------------------------------------------------------------------------- */
/*                           BOOLEAN TRANSFORM HELPER                         */
/* -------------------------------------------------------------------------- */

const toBoolean = (value: any): boolean | undefined => {
  if (value === true || value === 'true') return true;
  if (value === false || value === 'false') return false;
  return undefined;
};

export class PromotionQueryParamsDto {
  /* -------------------------------------------------------------------------- */
  /*                                   SEARCH                                   */
  /* -------------------------------------------------------------------------- */

  @ApiPropertyOptional({ type: String, description: 'Search query' })
  @IsOptional()
  @IsString()
  query?: string;

  /* -------------------------------------------------------------------------- */
  /*                                   ENUMS                                    */
  /* -------------------------------------------------------------------------- */

  @ApiPropertyOptional({
    enum: PromotionDiscountType,
    isArray: true,
    description: 'Discount entities',
  })
  @IsOptional()
  @IsArray()
  @Transform(({ value }) =>
    typeof value === 'string' ? value.split(',') : value,
  )
  @IsEnum(PromotionDiscountType, { each: true })
  discountType?: PromotionDiscountType[];

  @ApiPropertyOptional({
    enum: PromotionApplicability,
    isArray: true,
    description: 'Applicability entities',
  })
  @IsOptional()
  @IsArray()
  @Transform(({ value }) =>
    typeof value === 'string' ? value.split(',') : value,
  )
  @IsEnum(PromotionApplicability, { each: true })
  applicability?: PromotionApplicability[];

  @ApiPropertyOptional({
    enum: PromotionStatus,
    isArray: true,
    description: 'Promotion statuses',
  })
  @IsOptional()
  @IsArray()
  @Transform(({ value }) =>
    typeof value === 'string' ? value.split(',') : value,
  )
  @IsEnum(PromotionStatus, { each: true })
  status?: PromotionStatus[];

  /* -------------------------------------------------------------------------- */
  /*                                  BOOLEAN                                   */
  /* -------------------------------------------------------------------------- */

  @ApiPropertyOptional({ type: Boolean, description: 'Is stackable' })
  @IsOptional()
  @Transform(({ value }) => toBoolean(value))
  @IsBoolean()
  isStackable?: boolean;

  @ApiPropertyOptional({ type: Boolean, description: 'Is deleted' })
  @IsOptional()
  @Transform(({ value }) => toBoolean(value))
  @IsBoolean()
  isDeleted?: boolean;

  /* -------------------------------------------------------------------------- */
  /*                                  NUMBERS                                   */
  /* -------------------------------------------------------------------------- */

  @ApiPropertyOptional({ type: Number, description: 'Minimum priority' })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  priorityMin?: number;

  @ApiPropertyOptional({ type: Number, description: 'Maximum priority' })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  priorityMax?: number;

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
  /*                                   DATES                                    */
  /* -------------------------------------------------------------------------- */

  @ApiPropertyOptional({ type: String, description: 'Start date' })
  @IsOptional()
  @IsDate()
  @Type(() => Date)
  startDate?: Date;

  @ApiPropertyOptional({ type: String, description: 'End date' })
  @IsOptional()
  @IsDate()
  @Type(() => Date)
  endDate?: Date;

  /* -------------------------------------------------------------------------- */
  /*                               MAPPER METHOD                                */
  /* -------------------------------------------------------------------------- */

  toQueryParams(): PromotionQueryParams {
    const { page, pageSize, ...filter } = this;

    return {
      page,
      pageSize,
      filter,
    };
  }
}
