import { ZonePreviewResponseDto } from './zone-preview-response.dto';
import { Exclude, Expose, Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { TablePreviewResponseDto } from 'src/models/tables/dto';

@Exclude()
export class ZoneDetailedResponseDto extends ZonePreviewResponseDto {
  @Expose()
  @ApiProperty({
    description: 'Detailed description of the zone',
    type: String,
    nullable: true,
    example: 'Outdoor seating area with scenic views.',
  })
  description: string | null;

  @ApiPropertyOptional({
    type: () => TablePreviewResponseDto,
    description: 'Table information',
    nullable: true,
  })
  @Expose()
  @Type(() => TablePreviewResponseDto)
  tables: TablePreviewResponseDto | null;
}
