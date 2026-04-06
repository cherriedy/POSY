import { IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class StartSessionRequestDto {
  @ApiProperty({
    description: 'Table ID from QR code scan',
    example: 'f1a2b3d4-5678-90ab-cdef-1234567890ab',
  })
  @IsUUID()
  tableId: string;
}
