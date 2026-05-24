import { ApiProperty } from '@nestjs/swagger';

export class TableSessionTableInfoDto {
  @ApiProperty({
    description: 'Table ID',
    example: 't1a2b3c4-5678-90ab-cdef-1234567890ab',
  })
  id: string;

  @ApiProperty({
    description: 'Table name',
    example: 'Table 1',
  })
  name: string;
}

export class TableSessionResponseDto {
  @ApiProperty({
    description: 'Session ID',
    example: 's1a2b3d4-5678-90ab-cdef-1234567890ab',
  })
  id: string;

  @ApiProperty({
    description: 'Session status',
    example: 'ACTIVE',
  })
  status: string;

  @ApiProperty({
    description: 'Associated table information',
  })
  table: TableSessionTableInfoDto;

  @ApiProperty({
    description: 'Session start time',
    example: '2026-02-15T14:30:00.000Z',
  })
  startAt: Date;
}
