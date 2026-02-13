import { Expose } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { bulkOperationConfig } from '../config';

export class BulkOperationResponseDto<T extends object = any> {
  @ApiProperty({
    type: Number,
    description: 'Number of successful operations',
    example: 10,
    minimum: 0,
    maximum: bulkOperationConfig.size.max,
    title: 'Success Count',
  })
  @Expose()
  successCount: number;

  @ApiProperty({
    type: Number,
    description: 'Number of failed operations',
    example: 2,
    minimum: 0,
    maximum: bulkOperationConfig.size.max,
    title: 'Failed Count',
  })
  @Expose()
  failedCount: number;

  @ApiProperty({
    type: Number,
    description: 'Total number of operations attempted',
    example: 12,
    minimum: 1,
    maximum: bulkOperationConfig.size.max,
    title: 'Total Count',
  })
  @Expose()
  totalCount: number;

  @ApiProperty({
    description: 'Details of failed operations',
    isArray: true,
    title: 'Failures',
    example: [],
    type: 'object',
    additionalProperties: true,
  })
  @Expose()
  failures: T[];

  @ApiPropertyOptional({
    type: String,
    description: 'Additional message',
    example: 'Bulk operation completed with some failures.',
    title: 'Message',
  })
  @Expose()
  message?: string;
}
