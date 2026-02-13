import { ApiProperty } from '@nestjs/swagger';
import { Exclude, Expose } from 'class-transformer';

@Exclude()
export class FloorPreviewResponseDto {
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

  @ApiProperty({
    type: Boolean,
    description: 'Is floor active',
    example: true,
  })
  @Expose()
  isActive: boolean;

  @ApiProperty({
    type: Date,
    description: 'Creation date',
    example: '2026-02-13T12:34:56.789Z',
  })
  @Expose()
  createdAt: Date;

  @ApiProperty({
    type: Date,
    description: 'Last update date',
    example: '2026-02-13T12:34:56.789Z',
  })
  @Expose()
  updatedAt: Date;
}
