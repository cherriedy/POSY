import { ApiProperty } from '@nestjs/swagger';
import { Exclude, Expose } from 'class-transformer';

@Exclude()
export class ZonePreviewResponseDto {
  @ApiProperty({
    type: String,
    description: 'Zone ID',
    example: 'z1a2b3d4-5678-90ab-cdef-1234567890ab',
  })
  @Expose()
  id: string;

  @ApiProperty({
    type: String,
    description: 'Zone name',
    example: 'Outdoor Patio',
  })
  @Expose()
  name: string;

  @ApiProperty({
    type: Boolean,
    description: 'Is zone active',
    example: true,
  })
  @Expose()
  isActive: boolean;

  @ApiProperty({
    type: Date,
    description: 'Creation date',
    example: '2026-01-24T12:34:56.789Z',
  })
  @Expose()
  createdAt: Date;

  @ApiProperty({
    type: Date,
    description: 'Last update date',
    example: '2026-01-24T12:34:56.789Z',
  })
  @Expose()
  updatedAt: Date;
}
