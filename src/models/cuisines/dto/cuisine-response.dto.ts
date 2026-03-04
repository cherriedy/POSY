import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Exclude, Expose } from 'class-transformer';

/**
 * Response DTO for cuisine data.
 */
@Exclude()
export class CuisineResponseDto {
  @ApiProperty({
    description: 'Cuisine ID',
    example: 'c1a2b3d4-5678-90ab-cdef-1234567890ab',
  })
  @Expose()
  id: string;

  @ApiProperty({
    description: 'Cuisine name',
    example: 'Vietnamese',
  })
  @Expose()
  name: string;

  @ApiPropertyOptional({
    description: 'Geographic or cultural region',
    example: 'Southeast Asia',
    nullable: true,
  })
  @Expose()
  region: string | null;

  @ApiProperty({
    type: Boolean,
    description: 'Is cuisine active',
    example: true,
  })
  @Expose()
  isDeleted: boolean;

  @ApiProperty({
    description: 'Creation timestamp',
    example: '2024-01-01T00:00:00.000Z',
  })
  @Expose()
  createdAt: Date;

  @ApiProperty({
    description: 'Last update timestamp',
    example: '2024-01-01T00:00:00.000Z',
  })
  @Expose()
  updatedAt: Date;
}
