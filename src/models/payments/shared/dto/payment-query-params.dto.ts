import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import {
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';
import { SortDirection } from '../../../../common/interfaces';
import { PaymentStatus } from '../enums';
import {
  PaymentOrderBy,
  PaymentQueryParams,
  PaymentSortField,
} from '../interfaces';

export class PaymentQueryParamsDto {
  @ApiPropertyOptional({ type: Number, description: 'Page number', example: 1 })
  @IsOptional()
  @IsNumber()
  @Transform(({ value }) => parseInt(value as string, 10))
  page?: number;

  @ApiPropertyOptional({ type: Number, description: 'Page size', example: 20 })
  @IsOptional()
  @IsNumber()
  @Transform(({ value }) => parseInt(value as string, 10))
  pageSize?: number;

  @ApiPropertyOptional({
    type: String,
    description: 'Filter by order ID',
    example: 'f75f5f4c-8f83-41f0-9194-ff6736fb1ec2',
  })
  @IsOptional()
  @IsUUID()
  orderId?: string;

  @ApiPropertyOptional({
    type: String,
    description: 'Filter by payment method ID',
    example: '6d6d2a9a-69be-4cad-9a2f-68838f17cc19',
  })
  @IsOptional()
  @IsUUID()
  methodId?: string;

  @ApiPropertyOptional({
    type: String,
    description: 'Filter by creator user ID',
    example: '09fd5c9b-2759-477d-9f42-a2f143fd6520',
  })
  @IsOptional()
  @IsUUID()
  createdBy?: string;

  @ApiPropertyOptional({
    type: String,
    enum: PaymentStatus,
    description: 'Filter by payment status',
    example: PaymentStatus.COMPLETED,
  })
  @IsOptional()
  @IsEnum(PaymentStatus)
  status?: PaymentStatus;

  @ApiPropertyOptional({
    type: String,
    description:
      'Sort order as comma-separated `field:direction` pairs. Available fields: amount, status, paidAt, createdAt',
    example: 'createdAt:desc,amount:asc',
  })
  @IsOptional()
  @IsString()
  orderBy?: string;

  toQueryParams(): PaymentQueryParams {
    let parsedOrderBy: PaymentOrderBy | undefined;

    if (this.orderBy) {
      parsedOrderBy = this.orderBy.split(',').map((item) => {
        const [field, direction] = item.split(':');

        return {
          field: field as PaymentSortField,
          direction: direction as SortDirection,
        };
      });
    }

    return {
      page: this.page,
      pageSize: this.pageSize,
      orderBy: parsedOrderBy,
      filter: {
        orderId: this.orderId,
        methodId: this.methodId,
        createdBy: this.createdBy,
        status: this.status,
      },
    };
  }
}
