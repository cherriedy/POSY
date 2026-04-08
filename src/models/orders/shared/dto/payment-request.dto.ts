import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsArray,
  IsNotEmpty,
  IsNumber,
  IsObject,
  IsOptional,
  IsString,
  IsUUID,
  Min,
} from 'class-validator';

export class GenerateSnapshotRequestDto {
  @ApiPropertyOptional({
    type: [String],
    description: 'Promotion codes to apply to this snapshot',
  })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  promotionCodes?: string[];
}

export class ProcessPaymentRequestDto {
  @ApiProperty({ description: 'UUID of the PaymentMethod to charge' })
  @IsUUID()
  @IsNotEmpty()
  methodId: string;

  @ApiProperty({ description: 'Total amount the customer pays' })
  @IsNumber()
  @Min(0)
  amount: number;

  @ApiPropertyOptional({ description: 'Fee charged by the payment provider' })
  @IsNumber()
  @Min(0)
  @IsOptional()
  feeAmount?: number;

  @ApiPropertyOptional({
    description: 'External transaction / reference number',
  })
  @IsString()
  @IsOptional()
  referenceNumber?: string;

  @ApiPropertyOptional({ description: 'Staff user recording the payment' })
  @IsUUID()
  @IsOptional()
  createdBy?: string;

  @ApiPropertyOptional({ description: 'Additional metadata (gateway payload)' })
  @IsObject()
  @IsOptional()
  metadata?: Record<string, unknown>;
}
