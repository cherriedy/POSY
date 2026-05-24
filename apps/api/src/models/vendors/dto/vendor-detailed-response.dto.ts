import { ApiProperty } from '@nestjs/swagger';
import { Exclude, Expose } from 'class-transformer';
import { VendorPreviewResponseDto } from './vendor-preview-response.dto';

@Exclude()
export class VendorDetailedResponseDto extends VendorPreviewResponseDto {
  @ApiProperty({
    type: String,
    description: 'Business address',
    nullable: true,
  })
  @Expose()
  address: string | null;

  @ApiProperty({
    type: String,
    description: 'Tax code',
    nullable: true,
  })
  @Expose()
  taxCode: string | null;

  @ApiProperty({
    type: Number,
    description: 'Payment term in days',
    nullable: true,
    example: 30,
  })
  @Expose()
  paymentTerm: number | null;

  @ApiProperty({
    type: String,
    description: 'Additional notes',
    nullable: true,
  })
  @Expose()
  note: string | null;

  @ApiProperty({
    type: String,
    description: 'Reason for suspension',
    nullable: true,
  })
  @Expose()
  suspendedReason: string | null;

  @ApiProperty({
    type: String,
    format: 'date-time',
    description: 'Suspended start date',
    nullable: true,
  })
  @Expose()
  suspendedAt: string | null;

  @ApiProperty({
    type: Date,
    format: 'date-time',
    description: 'Suspended until date',
    nullable: true,
  })
  @Expose()
  suspendedUntil: Date | null;
}
