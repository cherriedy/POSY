import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  MaxLength,
  Min,
} from 'class-validator';
import { VendorStatus } from '../enums';

export class VendorCreateRequestDto {
  @ApiProperty({
    type: String,
    description: 'Vendor name',
    example: 'Fresh Farms Co.',
    maxLength: 255,
  })
  @IsNotEmpty()
  @IsString()
  @MaxLength(255)
  name: string;

  @ApiPropertyOptional({
    type: String,
    description: 'Contact person name',
    nullable: true,
    default: null,
  })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  contactName: string | null = null;

  @ApiPropertyOptional({
    type: String,
    description: 'Contact email',
    nullable: true,
    default: null,
  })
  @IsOptional()
  @IsEmail()
  @MaxLength(255)
  email: string | null = null;

  @ApiPropertyOptional({
    type: String,
    description: 'Contact phone number',
    nullable: true,
    default: null,
  })
  @IsOptional()
  @IsString()
  @MaxLength(10)
  phone: string | null = null;

  @ApiPropertyOptional({
    type: String,
    description: 'Business address',
    nullable: true,
    default: null,
  })
  @IsOptional()
  @IsString()
  address: string | null = null;

  @ApiPropertyOptional({
    type: String,
    description: 'Tax code',
    nullable: true,
    default: null,
  })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  taxCode: string | null = null;

  @ApiPropertyOptional({
    type: Number,
    description: 'Payment term in days',
    minimum: 0,
    nullable: true,
    default: null,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  paymentTerm: number | null = null;

  @ApiPropertyOptional({
    type: String,
    description: 'Additional notes',
    nullable: true,
    default: null,
  })
  @IsOptional()
  @IsString()
  note: string | null = null;

  @ApiPropertyOptional({
    enum: VendorStatus,
    description: 'Vendor status',
    default: VendorStatus.ACTIVE,
  })
  @IsOptional()
  @IsEnum(VendorStatus)
  status: VendorStatus = VendorStatus.ACTIVE;
}
