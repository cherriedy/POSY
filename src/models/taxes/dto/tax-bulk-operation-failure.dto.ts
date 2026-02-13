import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Expose } from 'class-transformer';

export class TaxBulkOperationFailureDto {
  @ApiProperty({ type: String, description: 'Entity or item ID' })
  @Expose()
  id: string;

  @ApiPropertyOptional({
    type: String,
    description: 'Entity type or item type',
  })
  @Expose()
  type?: string;

  @ApiProperty({ type: String, description: 'Error message' })
  @Expose()
  error: string;
}
