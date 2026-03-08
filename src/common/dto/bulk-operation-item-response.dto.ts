import { Expose } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { BulkOperationStatusEnum } from '../enums';
import { BulkOperationStatus } from '../types';

/**
 * Represents the response for an individual item in a bulk operation, including its ID, status,
 * and any error message if applicable.
 */
export class BulkOperationItemResponseDto {
  @Expose()
  @ApiProperty({
    type: String,
    description: 'The item ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  id: string;

  @Expose()
  @ApiProperty({
    description: 'Operation result status',
    enum: BulkOperationStatusEnum,
    example: BulkOperationStatusEnum.SUCCEED,
  })
  status: BulkOperationStatus;

  @Expose()
  @ApiProperty({
    type: String,
    required: false,
    description: 'Error message when status is failed',
    example: 'Failed to delete item due to foreign key constraint.',
  })
  error?: string;
}
