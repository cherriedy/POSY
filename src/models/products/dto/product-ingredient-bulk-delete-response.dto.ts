import { Expose, Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { BulkOperationStatusEnum } from '../../../common/enums';
import { BulkOperationStatus } from '../../../common/types';

/**
 * Represents the response for an individual ingredient in a bulk delete operation.
 */
export class ProductIngredientBulkDeleteItemResponseDto {
  @Expose()
  @ApiProperty({
    type: String,
    description: 'The ingredient ID',
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
    example: 'Ingredient with ID xyz is not associated with product abc',
  })
  error?: string;
}

export class ProductIngredientBulkDeleteResponseDto {
  @Expose()
  @ApiProperty({ type: [ProductIngredientBulkDeleteItemResponseDto] })
  @Type(() => ProductIngredientBulkDeleteItemResponseDto)
  items: ProductIngredientBulkDeleteItemResponseDto[];

  @Expose()
  @ApiProperty({ description: 'Total number of items processed' })
  total: number;

  @Expose()
  @ApiProperty({ description: 'Number of successfully deleted items' })
  succeeded: number;

  @Expose()
  @ApiProperty({ description: 'Number of failed items' })
  failed: number;
}
