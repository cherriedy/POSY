import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsUUID, IsInt, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { OrderStatus } from '../enums';
import { OrderQueryParams } from '../interfaces';

export class OrderQueryParamsDto {
  @ApiPropertyOptional({ type: Number, description: 'Page number', example: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number;

  @ApiPropertyOptional({ type: Number, description: 'Page size', example: 10 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  pageSize?: number;

  @ApiPropertyOptional({ type: String, description: 'Filter by session ID' })
  @IsOptional()
  @IsUUID()
  sessionId?: string;

  @ApiPropertyOptional({ type: String, description: 'Filter by table ID' })
  @IsOptional()
  @IsUUID()
  tableId?: string;

  @ApiPropertyOptional({
    type: String,
    description: 'Filter by creator user ID',
  })
  @IsOptional()
  @IsUUID()
  createdBy?: string;

  @ApiPropertyOptional({ enum: OrderStatus, description: 'Filter by status' })
  @IsOptional()
  @IsEnum(OrderStatus)
  status?: OrderStatus;

  toQueryParams(): OrderQueryParams {
    return {
      page: this.page,
      pageSize: this.pageSize,
      filter: {
        sessionId: this.sessionId,
        tableId: this.tableId,
        createdBy: this.createdBy,
        status: this.status,
      },
    };
  }
}
