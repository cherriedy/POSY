import { TablePreviewResponseDto } from './table-preview-response.dto';
import { Exclude, Expose, Type } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { ZonePreviewResponseDto } from 'src/models/zones/dto';

@Exclude()
export class TableDetailedResponseDto extends TablePreviewResponseDto {
  @ApiPropertyOptional({
    type: () => ZonePreviewResponseDto,
    description: 'Zone information',
    nullable: true,
  })
  @Expose()
  @Type(() => ZonePreviewResponseDto)
  zone?: ZonePreviewResponseDto | null;

  @ApiPropertyOptional({
    type: Number,
    description: 'X coordinate for layout positioning',
    nullable: true,
    example: 100,
  })
  @Expose()
  posX: number | null;

  @ApiPropertyOptional({
    type: Number,
    description: 'Y coordinate for layout positioning',
    nullable: true,
    example: 200,
  })
  @Expose()
  posY: number | null;
}
