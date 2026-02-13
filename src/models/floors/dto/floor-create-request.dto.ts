import { IsBoolean, IsInt } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsValidFloorName, IsValidFloorOrder } from '../decorators';

export class FloorCreateRequestDto {
  @ApiProperty({
    description: 'Name of the floor',
    example: 'Ground Floor',
  })
  @IsValidFloorName()
  name: string;

  @ApiProperty({
    description: 'Display order of the floor',
    example: 0,
  })
  @IsInt()
  @IsValidFloorOrder()
  order: number;

  @ApiPropertyOptional({
    description: 'Whether the floor is active',
    example: true,
    default: true,
  })
  @IsBoolean()
  isActive?: boolean = true;
}
