import {
  IsArray,
  ValidateNested,
  ArrayMinSize,
  ArrayMaxSize,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { TaxAssociationItemCreateRequestDto } from './tax-association-item-create-request.dto';

export class TaxAssociationCreateRequestDto {
  @ApiProperty({
    type: [TaxAssociationItemCreateRequestDto],
    description:
      'Array of entities to associate with the tax (1-100 entities per request). Each entity can have its own isActive and note values.',
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
  @Type(() => TaxAssociationItemCreateRequestDto)
  entities: TaxAssociationItemCreateRequestDto[];
}
