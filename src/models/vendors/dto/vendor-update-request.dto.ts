import { PartialType } from '@nestjs/mapped-types';
import { VendorCreateRequestDto } from './vendor-create-request.dto';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, IsDate } from 'class-validator';
import { Type } from 'class-transformer';

export class VendorUpdateRequestDto extends PartialType(
  VendorCreateRequestDto,
) {
  @ApiPropertyOptional({
    type: String,
    description: 'Reason for suspending the vendor',
    nullable: true,
  })
  @IsOptional()
  @IsString()
  suspendedReason?: string | null;

  @ApiPropertyOptional({
    type: Date,
    format: 'date-time',
    description: 'Date until the vendor is suspended (ISO 8601)',
    nullable: true,
    example: '2026-03-31T00:00:00.000Z',
  })
  @IsOptional()
  @IsDate()
  @Type(() => Date)
  suspendedUntil?: Date | null;
}