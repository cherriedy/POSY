import {
  IsArray,
  IsUUID,
  ArrayMinSize,
  ArrayMaxSize,
  IsNotEmpty,
  IsOptional,
  IsBoolean,
  IsString,
  ValidateNested,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { TaxableEntityReferenceDto } from './taxable-entity-reference.dto';
import { Type } from 'class-transformer';

/**
 * Represents an individual item in a bulk tax association upsert operation, including the entity reference,
 * optional active status, and an optional note.
 *
 */
export class TaxAssociationUpsertItemRequestDto {
  @ApiProperty({
    type: TaxableEntityReferenceDto,
    description: `Reference to the entity for which the tax association is being upserted.`,
  })
  @IsNotEmpty()
  @ValidateNested()
  @Type(() => TaxableEntityReferenceDto)
  entityRef: TaxableEntityReferenceDto;

  @ApiProperty({
    description: 'Is association active',
    required: false,
    example: true,
    type: Boolean,
  })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean = true;

  @ApiProperty({
    description: 'Optional note about association',
    required: false,
    example: 'Special tax note',
    type: String,
  })
  @IsOptional()
  @IsString()
  note?: string;
}

/**
 * Represents the request payload for bulk upserting tax associations, containing an array of items to process.
 */
export class TaxAssociationBulkUpsertRequestDto {
  @ApiProperty({
    type: [TaxAssociationUpsertItemRequestDto],
    description: `Array of entities to upsert associations for. If an association for the entity
     already exists it will be updated, otherwise a new one will be created.`,
    example: [
      {
        entityType: 'ZONE',
        entityId: '123e4567-e89b-12d3-a456-426614174000',
        isActive: true,
        note: 'Main dining area',
      },
      {
        entityType: 'ZONE',
        entityId: '223e4567-e89b-12d3-a456-426614174001',
        isActive: false,
        note: 'Bar area - disabled temporarily',
      },
    ],
  })
  @IsArray()
  @ArrayMinSize(1)
  @ArrayMaxSize(100)
  @ValidateNested({ each: true })
  @Type(() => TaxAssociationUpsertItemRequestDto)
  items: TaxAssociationUpsertItemRequestDto[];
}

/**
 * Represents the request payload for deleting tax associations in bulk, identified by their unique IDs.
 */
export class TaxAssociationDeleteRequestDto {
  @ApiProperty({
    type: [String],
    description: 'Array of association IDs to remove (1-100 IDs per request)',
    example: [
      '123e4567-e89b-12d3-a456-426614174000',
      '223e4567-e89b-12d3-a456-426614174001',
    ],
  })
  @IsArray()
  @ArrayMinSize(1)
  @ArrayMaxSize(100)
  @IsUUID('4', { each: true })
  associationIds: string[];
}