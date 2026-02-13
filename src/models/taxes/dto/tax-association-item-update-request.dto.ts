import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsOptional, IsString, IsUUID } from 'class-validator';

export class TaxAssociationItemUpdateRequestDto {
  @ApiProperty({
    description: 'Association ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsUUID('4')
  id: string;

  @ApiProperty({
    description: 'Is association active',
    required: false,
    example: true,
    type: Boolean,
  })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

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
