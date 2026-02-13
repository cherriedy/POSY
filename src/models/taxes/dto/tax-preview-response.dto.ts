import { ApiProperty } from '@nestjs/swagger';
import { Exclude, Expose } from 'class-transformer';
import { TaxType, TaxRateType } from '../enums';

@Exclude()
export class TaxPreviewResponseDto {
  @ApiProperty({ type: String, description: 'Tax ID' })
  @Expose()
  id: string;

  @ApiProperty({ enum: TaxType, description: 'Tax type' })
  @Expose()
  type: TaxType;

  @ApiProperty({ type: String, description: 'Tax name' })
  @Expose()
  name: string;

  @ApiProperty({ type: String, description: 'Tax display name' })
  @Expose()
  displayName: string;

  @ApiProperty({ enum: TaxRateType, description: 'Rate type' })
  @Expose()
  rateType: TaxRateType;

  @ApiProperty({ type: Number, description: 'Charge rate' })
  @Expose()
  chargeRate: number;

  @ApiProperty({ type: Boolean, description: 'Is active' })
  @Expose()
  isActive: boolean;

  @ApiProperty({ type: Boolean, description: 'Is included in price' })
  @Expose()
  isIncluded: boolean;

  @ApiProperty({ type: Boolean, description: 'Apply after VAT' })
  @Expose()
  applyAfterVAT: boolean;

  @ApiProperty({ type: Number, description: 'Sort order' })
  @Expose()
  sortOrder: number;

  @ApiProperty({ type: Boolean, description: 'Is deleted' })
  @Expose()
  isDeleted: boolean;

  @ApiProperty({ type: Date, description: 'Created at' })
  @Expose()
  createdAt: Date;

  @ApiProperty({ type: Date, description: 'Updated at' })
  @Expose()
  updatedAt: Date;
}
