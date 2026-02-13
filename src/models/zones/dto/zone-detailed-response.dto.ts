import { ZonePreviewResponseDto } from './zone-preview-response.dto';
import { Exclude, Expose } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

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
}
