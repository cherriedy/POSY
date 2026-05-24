import { IsBoolean, IsUUID } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsValidZoneName } from '../decorators/is-valid-name.decorator';
import { IsValidZoneDescription } from '../decorators/is-valid-description.decorator';

export class ZoneCreateRequestDto {
  @ApiProperty({
    description: 'Name of the zone',
    example: 'VIP Section',
  })
  @IsValidZoneName()
  name: string;

  @ApiPropertyOptional({
    description: 'Description of the zone',
    example: 'A premium dining area',
  })
  @IsValidZoneDescription()
  description?: string;

  @ApiPropertyOptional({
    description: 'Whether the zone is active',
    example: true,
    default: true,
  })
  @IsBoolean()
  isActive?: boolean = true;

  @ApiProperty({
    description: 'Unique identifier of the floor this zone belongs to',
    example: 'floor-uuid',
  })
  @IsUUID()
  floorId: string;
}
