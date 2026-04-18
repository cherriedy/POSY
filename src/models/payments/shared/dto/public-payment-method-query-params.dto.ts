import { Transform } from 'class-transformer';
import { IsNumber, IsOptional } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { PaymentMethodQueryParams } from '../interfaces';

export class PublicPaymentMethodQueryParamsDto {
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

  toQueryParams(): PaymentMethodQueryParams {
    return {
      page: this.page,
      pageSize: this.pageSize,
      filter: {
        enabledOnly: true,
      },
    };
  }
}
