import { IsBoolean } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsValidZoneDescription, IsValidZoneName } from '../decorators';

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
}
