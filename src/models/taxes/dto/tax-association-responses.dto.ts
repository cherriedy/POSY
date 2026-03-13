import { Expose, Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { TaxRateType } from '../enums';
import { TaxableEntityReferenceDto } from './taxable-entity-reference.dto';
import { BulkOperationStatusEnum } from '../../../common/enums';
import { BulkOperationStatus } from '../../../common/types';

/**
 * Represents the tax configuration details included in a tax association response.
 */
export class TaxAssociationTaxConfigResponseDto {
  @ApiProperty({ type: String, description: 'Tax ID' })
  @Expose()
  id: string;

  @ApiProperty({ type: String, description: 'Tax name' })
  @Expose()
  name: string;

  @ApiProperty({ type: String, description: 'Tax rate' })
  @Expose()
  rateType: TaxRateType;

  @ApiProperty({ type: Number, description: 'Charge rate' })
  @Expose()
  chargeRate: number;

  @ApiProperty({ type: Boolean, description: 'Is included in price' })
  @Expose()
  isIncluded: boolean;

  @ApiProperty({ type: Boolean, description: 'Is active' })
  @Expose()
  isActive: boolean;

  @ApiProperty({ type: Number, description: 'Is deleted' })
  @Expose()
  isDeleted: boolean;

  @ApiProperty({ type: Date, description: 'Deleted at' })
  @Expose()
  deletedAt?: Date;
}

/**
 * Represents the response for a tax association, including association details and related tax configuration.
 */
export class TaxAssociationResponseDto {
  @ApiProperty({ type: String, description: 'Association ID' })
  @Expose()
  id: string;

  @ApiPropertyOptional({
    type: String,
    description: `Entity ID associated with the tax configuration, optional as sometimes the 
    response my include entity reference instead`,
  })
  @Expose()
  entityId?: string;

  @ApiPropertyOptional({
    type: String,
    description: `Entity type associated with the tax configuration, optional as sometimes the 
    response my include entity reference instead`,
  })
  @Expose()
  entityType?: string;

  @ApiProperty({ type: Boolean, description: 'Is association active' })
  @Expose()
  isActive: boolean;

  @ApiPropertyOptional({ type: String, description: 'Note' })
  @Expose()
  note?: string;

  @ApiProperty({ type: Date, description: 'Created at' })
  @Expose()
  createdAt: Date;

  @ApiProperty({ type: Date, description: 'Updated at' })
  @Expose()
  updatedAt: Date;

  @ApiProperty({
    type: TaxAssociationTaxConfigResponseDto,
    description: 'Tax details',
  })
  @Expose()
  @Type(() => TaxAssociationTaxConfigResponseDto)
  tax: TaxAssociationTaxConfigResponseDto;
}

/**
 * Represents the response for an individual entity in a bulk tax association upsert operation.
 */
export class TaxAssociationBulkUpsertItemResponseDto {
  @Expose()
  @ApiProperty({
    type: TaxableEntityReferenceDto,
    description: `Reference to the entity for which the tax association was upserted`,
  })
  entityRef: TaxableEntityReferenceDto;

  @Expose()
  @ApiProperty({
    type: String,
    description: 'Operation result status',
    enum: BulkOperationStatusEnum,
    example: BulkOperationStatusEnum.SUCCEED,
  })
  status: BulkOperationStatus;

  @Expose()
  @ApiProperty({
    type: TaxAssociationResponseDto,
    required: false,
    description: 'The tax association config from successful operations',
  })
  @Type(() => TaxAssociationResponseDto)
  association?: TaxAssociationResponseDto;

  @Expose()
  @ApiProperty({
    type: String,
    required: false,
    description: 'Error message when status is failed',
    example: 'Failed to upsert association due to invalid entity reference.',
  })
  error?: string;
}

/**
 * Represents the overall response for a bulk tax association upsert operation, including
 * per-item results and summary statistics.
 */
export class TaxAssociationBulkUpsertResponseDto {
  @Expose()
  @ApiProperty({ type: [TaxAssociationBulkUpsertItemResponseDto] })
  @Type(() => TaxAssociationBulkUpsertItemResponseDto)
  items: TaxAssociationBulkUpsertItemResponseDto[];

  @Expose()
  @ApiProperty({ description: 'Total number of items processed' })
  total: number;

  @Expose()
  @ApiProperty({ description: 'Number of successfully upserted items' })
  succeeded: number;

  @Expose()
  @ApiProperty({ description: 'Number of failed items' })
  failed: number;
}

/**
 * Represents the per-item result of a bulk entity-tax association removal operation.
 */
export class TaxAssociationBulkRemoveItemResponseDto {
  @Expose()
  @ApiProperty({
    type: TaxableEntityReferenceDto,
    description: `Reference to the entity for which the tax association was attempted to be removed`,
  })
  entity: TaxableEntityReferenceDto;

  @Expose()
  @ApiProperty({
    type: String,
    description: 'Operation result status',
    enum: BulkOperationStatusEnum,
    example: BulkOperationStatusEnum.SUCCEED,
  })
  status: BulkOperationStatus;

  @Expose()
  @ApiPropertyOptional({
    type: String,
    description: 'Error message when status is FAILED',
    example: 'Association with ID … not found.',
  })
  error?: string;
}

/**
 * Overall response for a bulk entity-tax association removal operation.
 */
export class TaxAssociationBulkRemoveResponseDto {
  @Expose()
  @ApiProperty({ type: [TaxAssociationBulkRemoveItemResponseDto] })
  @Type(() => TaxAssociationBulkRemoveItemResponseDto)
  items: TaxAssociationBulkRemoveItemResponseDto[];

  @Expose()
  @ApiProperty({ description: 'Total number of associations targeted' })
  total: number;

  @Expose()
  @ApiProperty({ description: 'Number of successfully removed associations' })
  succeeded: number;

  @Expose()
  @ApiProperty({ description: 'Number of failed removals' })
  failed: number;
}
