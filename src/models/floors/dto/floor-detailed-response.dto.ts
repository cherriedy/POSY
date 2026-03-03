import { ApiProperty } from '@nestjs/swagger';
import { FloorPreviewResponseDto } from './floor-preview-response.dto';
import { Exclude, Expose, Type } from 'class-transformer';
import { TablePreviewResponseDto } from 'src/models/tables/dto';
import { ZonePreviewResponseDto } from 'src/models/zones/dto';

@Exclude()
export class FloorDetailedResponseDto extends FloorPreviewResponseDto {
  @Expose()
  @ApiProperty({
    type: [TablePreviewResponseDto],
    description: 'List of tables on the floor',
  })
  @Type(() => TablePreviewResponseDto)
  tables: TablePreviewResponseDto[];

  @Expose()
  @ApiProperty({
    type: [ZonePreviewResponseDto],
    description: 'List of zones on the floor',
  })
  @Type(() => TablePreviewResponseDto)
  zones: ZonePreviewResponseDto[];

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
