import { ApiProperty } from '@nestjs/swagger';
import { Exclude, Expose } from 'class-transformer';

@Exclude()
export class TableZoneResponseDto {
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
    description: 'Indicates if the zone is active',
    example: true,
  })
  @Expose()
  isActive: boolean;
}
