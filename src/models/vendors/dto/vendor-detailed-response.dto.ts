import { ApiProperty } from '@nestjs/swagger';
import { Exclude, Expose } from 'class-transformer';
import { VendorStatus } from '../enums';

@Exclude()
export class VendorDetailedResponseDto {
  @ApiProperty({ type: String, description: 'Vendor ID' })
  @Expose()
  id: string;

  @ApiProperty({ type: String, description: 'Vendor name' })
  @Expose()
  name: string;

  @ApiProperty({
    type: String,
    description: 'Contact person name',
    nullable: true,
  })
  @Expose()
  contactName: string | null;

  @ApiProperty({ type: String, description: 'Contact email', nullable: true })
  @Expose()
  email: string | null;

  @ApiProperty({
    type: String,
    description: 'Contact phone number',
    nullable: true,
  })
  @Expose()
  phone: string | null;

  @ApiProperty({
    type: String,
    description: 'Business address',
    nullable: true,
  })
  @Expose()
  address: string | null;

  @ApiProperty({ type: String, description: 'Tax code', nullable: true })
  @Expose()
  taxCode: string | null;

  @ApiProperty({
    type: Number,
    description: 'Payment term in days',
    nullable: true,
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

  @ApiProperty({ enum: VendorStatus, description: 'Vendor status' })
  @Expose()
  status: VendorStatus;

  @ApiProperty({ type: Date, description: 'Created at' })
  @Expose()
  createdAt: Date;

  @ApiProperty({ type: Date, description: 'Updated at' })
  @Expose()
  updatedAt: Date;
}
