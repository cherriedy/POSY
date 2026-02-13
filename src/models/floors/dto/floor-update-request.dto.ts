import { IsBoolean, IsInt, IsOptional } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsValidFloorName, IsValidFloorOrder } from '../decorators';

export class FloorUpdateRequestDto {
  @ApiPropertyOptional({
    description: 'Name of the floor',
    example: 'Ground Floor',
  })
  @IsOptional()
  @IsValidFloorName()
  name?: string;

  @ApiPropertyOptional({
    description: 'Display order of the floor',
    example: 0,
  })
  @IsOptional()
  @IsInt()
  @IsValidFloorOrder()
  order?: number;

  @ApiPropertyOptional({
    description: 'Whether the floor is active',
    example: true,
  })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
