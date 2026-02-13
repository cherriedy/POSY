import { ApiPropertyOptional } from '@nestjs/swagger';
import { Expose } from 'class-transformer';
import { TaxPreviewResponseDto } from './tax-preview-response.dto';

export class TaxDetailedResponseDto extends TaxPreviewResponseDto {
  @ApiPropertyOptional({ type: String, description: 'Tax description' })
  @Expose()
  description: string | null;

  @ApiPropertyOptional({ type: Date, description: 'Deleted at' })
  @Expose()
  deletedAt: Date | null;
}
