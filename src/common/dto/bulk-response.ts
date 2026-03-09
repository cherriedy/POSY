import { ApiProperty } from '@nestjs/swagger';
import { Expose, Type } from 'class-transformer';

/**
 * Represents the response for a bulk operation, containing an array of item responses, total count,
 * and counts of succeeded and failed operations.
 */
export class BulkResponseDto<T extends object = any> {
  @Expose()
  @ApiProperty({
    type: Object,
    isArray: true,
    description: 'Array of operation results',
  })
  @Type(() => Object)
  items: T[];

  @Expose()
  @ApiProperty({
    type: Number,
    description: 'Total number of items processed',
  })
  total: number;

  @Expose()
  @ApiProperty({
    type: Number,
    description: 'Number of successfully deleted items',
  })
  succeeded: number;

  @Expose()
  @ApiProperty({ type: Number, description: 'Number of failed items' })
  failed: number;
}
