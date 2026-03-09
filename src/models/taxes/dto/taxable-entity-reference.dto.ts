import { EntityType } from '../enums';
import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';
import { IsEnum, IsUUID } from 'class-validator';

/**
 * DTO representing a reference to a taxable entity.
 */
export class TaxableEntityReferenceDto {
  @Expose()
  @ApiProperty({
    type: String,
    description: 'The unique identifier of the taxable entity',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsUUID('4')
  id: string;

  @Expose()
  @ApiProperty({
    type: String,
    enum: EntityType,
    description: 'The type of the taxable entity',
    example: EntityType.ZONE,
  })
  @IsEnum(EntityType)
  type: string;
}
