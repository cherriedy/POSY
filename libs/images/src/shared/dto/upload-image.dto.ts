import { IsNotEmpty, IsOptional, IsString, IsUUID } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class UploadImageDto {
  @ApiProperty({
    description: 'Session ID to group temporary images',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsNotEmpty()
  @IsString()
  @IsUUID()
  sessionId: string;

  @ApiPropertyOptional({
    description: 'Optional entity type (e.g., product, category)',
    example: 'product',
  })
  @IsOptional()
  @IsString()
  entityType?: string;

  @ApiPropertyOptional({
    description: 'Optional entity ID',
    example: '1',
  })
  @IsOptional()
  @IsString()
  entityId?: string;
}
