import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsEnum, IsOptional, IsString } from 'class-validator';
import { EntityType } from '../enums';

export class TaxAssociationItemCreateRequestDto {
  @ApiProperty({
    description: 'ID of the entity to associate with the tax',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsString()
  entityId: string;

  @IsEnum(EntityType)
  @ApiProperty({
    description: 'Type of entity to associate with the tax',
    example: EntityType.ZONE,
    enum: EntityType,
  })
  entityType: EntityType;

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
