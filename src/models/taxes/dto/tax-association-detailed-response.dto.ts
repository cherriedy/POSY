import { Expose, Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { TaxPreviewResponseDto } from './tax-preview-response.dto';

export class TaxAssociationDetailedResponseDto {
  @ApiProperty({ type: String, description: 'Association ID' })
  @Expose()
  id: string;

  @ApiProperty({ type: String, description: 'Tax ID' })
  @Expose()
  taxId: string;

  @ApiProperty({ type: String, description: 'Entity ID' })
  @Expose()
  entityId: string;

  @ApiProperty({ type: String, description: 'Entity type' })
  @Expose()
  entityType: string;

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

  @ApiProperty({ type: TaxPreviewResponseDto, description: 'Tax details' })
  @Expose()
  @Type(() => TaxPreviewResponseDto)
  tax: TaxPreviewResponseDto;
}
