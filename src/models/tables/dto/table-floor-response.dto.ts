import { ApiProperty } from '@nestjs/swagger';
import { Exclude, Expose } from 'class-transformer';

@Exclude()
export class TableFloorResponseDto {
  @ApiProperty({
    type: String,
    description: 'Floor ID',
    example: 'f1a2b3d4-5678-90ab-cdef-1234567890ab',
  })
  @Expose()
  id: string;

  @ApiProperty({
    type: String,
    description: 'Floor name',
    example: 'Ground Floor',
  })
  @Expose()
  name: string;

  @ApiProperty({
    type: Number,
    description: 'Display order of the floor',
    example: 0,
  })
  @Expose()
  order: number;
}
