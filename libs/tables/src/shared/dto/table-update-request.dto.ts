import { IsBoolean, IsEnum, IsInt, IsOptional, IsUUID } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsValidTableName } from '../decorators/is-valid-name.decorator';
import { IsValidTableCapacity } from '../decorators/is-valid-capacity.decorator';
import { TableStatus } from '../enums/table-status.enum';

export class TableUpdateRequestDto {
  @ApiPropertyOptional({ description: 'Name of the table', example: 'T-101' })
  @IsOptional()
  @IsValidTableName()
  name?: string;

  @ApiPropertyOptional({ description: 'Seating capacity', example: 4 })
  @IsOptional()
  @IsInt()
  @IsValidTableCapacity()
  capacity?: number;

  @ApiPropertyOptional({ description: 'Zone ID', nullable: true })
  @IsOptional()
  @IsUUID()
  zoneId?: string | null;

  @ApiPropertyOptional({ description: 'Table status', enum: TableStatus })
  @IsOptional()
  @IsEnum(TableStatus)
  status?: TableStatus;

  @ApiPropertyOptional({ description: 'X coordinate', nullable: true })
  @IsOptional()
  @IsInt()
  posX?: number | null;

  @ApiPropertyOptional({ description: 'Y coordinate', nullable: true })
  @IsOptional()
  @IsInt()
  posY?: number | null;

  @ApiPropertyOptional({ description: 'Whether the table is active' })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
