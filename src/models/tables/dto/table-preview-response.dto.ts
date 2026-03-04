import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Exclude, Expose, Type } from 'class-transformer';
import { TableStatus } from '../enums';
import { ZonePreviewResponseDto } from 'src/models/zones/dto';

@Exclude()
export class TablePreviewResponseDto {
  @ApiProperty({
    type: String,
    description: 'Table ID',
    example: 't1a2b3d4-5678-90ab-cdef-1234567890ab',
  })
  @Expose()
  id: string;

  @ApiProperty({
    type: String,
    description: 'Table name',
    example: 'T-101',
  })
  @Expose()
  name: string;

  @ApiProperty({
    type: Number,
    description: 'Seating capacity',
    example: 4,
  })
  @Expose()
  capacity: number;

  @ApiProperty({
    type: String,
    enum: TableStatus,
    description: 'Current status of the table',
    example: TableStatus.AVAILABLE,
  })
  @Expose()
  status: TableStatus;

  @ApiPropertyOptional({
    type: () => ZonePreviewResponseDto,
    description: 'Zone information',
    nullable: true,
  })
  @Expose()
  @Type(() => ZonePreviewResponseDto)
  zone?: ZonePreviewResponseDto | null;

  @ApiProperty({
    type: Boolean,
    description: 'Is table active',
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
