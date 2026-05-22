import { IsBoolean, IsEnum, IsInt, IsOptional, IsUUID } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsValidTableName } from '../decorators/is-valid-name.decorator';
import { IsValidTableCapacity } from '../decorators/is-valid-capacity.decorator';
import { TableStatus } from '../enums/table-status.enum';

export class TableCreateRequestDto {
  @ApiProperty({
    description: 'Name of the table',
    example: 'T-101',
  })
  @IsValidTableName()
  name: string;

  @ApiProperty({
    description: 'Seating capacity of the table',
    example: 4,
  })
  @IsInt()
  @IsValidTableCapacity()
  capacity: number;

  @ApiPropertyOptional({
    description: 'Zone ID where the table is located',
    example: 'z1a2b3d4-5678-90ab-cdef-1234567890ab',
    nullable: true,
  })
  @IsOptional()
  @IsUUID()
  zoneId?: string | null;

  @ApiPropertyOptional({
    description: 'Table status',
    example: TableStatus.AVAILABLE,
    enum: TableStatus,
    default: TableStatus.AVAILABLE,
  })
  @IsOptional()
  @IsEnum(TableStatus)
  status?: TableStatus = TableStatus.AVAILABLE;

  @ApiPropertyOptional({
    description: 'X coordinate for layout positioning',
    example: 100,
    nullable: true,
  })
  @IsOptional()
  @IsInt()
  posX?: number | null;

  @ApiPropertyOptional({
    description: 'Y coordinate for layout positioning',
    example: 200,
    nullable: true,
  })
  @IsOptional()
  @IsInt()
  posY?: number | null;

  @ApiPropertyOptional({
    description: 'Whether the table is active',
    example: true,
    default: true,
  })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean = true;
}
