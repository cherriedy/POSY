import {
  ArrayMaxSize,
  ArrayMinSize,
  IsArray,
  ValidateNested,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { TaxAssociationItemUpdateRequestDto } from './tax-association-item-update-request.dto';

export class TaxAssociationUpdateRequestDto {
  @ApiProperty({
    type: [TaxAssociationItemUpdateRequestDto],
    description: 'Array of association updates (1-100 items per request)',
    example: [
      {
        id: '123e4567-e89b-12d3-a456-426614174000',
        isActive: true,
        note: 'First note',
      },
      {
        id: '223e4567-e89b-12d3-a456-426614174001',
        isActive: false,
        note: 'Second note',
      },
    ],
  })
  @IsArray()
  @ArrayMinSize(1)
  @ArrayMaxSize(100)
  @ValidateNested({ each: true })
  @Type(() => TaxAssociationItemUpdateRequestDto)
  items: TaxAssociationItemUpdateRequestDto[];
}
