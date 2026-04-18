import { Transform } from 'class-transformer';
import { IsBoolean, IsNumber, IsOptional, IsString } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { SortDirection } from '../../../../common/interfaces';
import {
  PaymentMethodOrderBy,
  PaymentMethodQueryParams,
  PaymentMethodSortField,
} from '../interfaces';

export class PaymentMethodQueryParamsDto {
  @ApiPropertyOptional({ type: Number, description: 'Page number' })
  @IsOptional()
  @IsNumber()
  @Transform(({ value }) => parseInt(value as string, 10))
  page?: number;

  @ApiPropertyOptional({ type: Number, description: 'Page size' })
  @IsOptional()
  @IsNumber()
  @Transform(({ value }) => parseInt(value as string, 10))
  pageSize?: number;

  @ApiPropertyOptional({
    type: Boolean,
    description: 'Only return enabled payment methods',
  })
  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => {
    if (value === 'true' || value === true) return true;
    if (value === 'false' || value === false) return false;
    return undefined;
  })
  enabledOnly?: boolean;

  @ApiPropertyOptional({
    type: String,
    description:
      'Sort order as comma-separated `field:direction` pairs. ' +
      'Available fields: name, feeType, feeValue',
    example: 'name:asc,feeValue:desc',
  })
  @IsOptional()
  @IsString()
  orderBy?: string;

  toQueryParams(): PaymentMethodQueryParams {
    let parsedOrderBy: PaymentMethodOrderBy | undefined;

    if (this.orderBy) {
      parsedOrderBy = this.orderBy.split(',').map((item) => {
        const [field, direction] = item.split(':');
        return {
          field: field as PaymentMethodSortField,
          direction: direction as SortDirection,
        };
      });
    }

    return {
      page: this.page,
      pageSize: this.pageSize,
      orderBy: parsedOrderBy,
      filter: {
        enabledOnly: this.enabledOnly,
      },
    };
  }
}
