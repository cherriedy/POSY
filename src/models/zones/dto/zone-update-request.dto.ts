import { IsBoolean, IsOptional } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsValidZoneDescription, IsValidZoneName } from '../decorators';

export class ZoneUpdateRequestDto {
  @ApiPropertyOptional({
    description: 'Name of the zone',
    example: 'VIP Section',
  })
  @IsOptional()
  @IsValidZoneName()
  name?: string;

  @ApiPropertyOptional({
    description: 'Description of the zone',
    example: 'A premium dining area',
  })
  @IsOptional()
  @IsValidZoneDescription()
  description?: string;

  @ApiPropertyOptional({
    description: 'Whether the zone is active',
    example: true,
  })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
