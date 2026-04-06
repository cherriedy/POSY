import {
  IsUUID,
  IsString,
  IsNumber,
  IsOptional,
  IsDateString,
  Min,
  IsNotEmpty,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class IngredientCreateUpdateDto {
  @ApiProperty({
    type: String,
    description: 'Vendor ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsNotEmpty()
  @IsUUID()
  vendorId: string;

  @ApiProperty({
    type: String,
    description: 'Unit ID',
    example: '123e4567-e89b-12d3-a456-426614174001',
  })
  @IsNotEmpty()
  @IsUUID()
  unitId: string;

  @ApiProperty({
    type: String,
    description: 'Ingredient name',
    example: 'Tomato',
  })
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiProperty({
    type: Number,
    description: 'Current stock quantity',
    example: 100,
    minimum: 0,
  })
  @IsNotEmpty()
  @IsNumber()
  @Min(0)
  stock: number;

  @ApiProperty({
    type: Number,
    description: 'Minimum stock level',
    example: 20,
    minimum: 0,
  })
  @IsNotEmpty()
  @IsNumber()
  @Min(0)
  minStock: number;

  @ApiProperty({
    type: Number,
    description: 'Unit cost',
    example: 5.99,
    minimum: 0,
  })
  @IsNotEmpty()
  @IsNumber()
  @Min(0)
  unitCost: number;

  @ApiPropertyOptional({
    type: String,
    description: 'Expiration date',
    example: '2024-12-31',
  })
  @IsOptional()
  @IsDateString()
  expiredAt?: string;
}
