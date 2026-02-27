import {
  IsArray,
  ValidateNested,
  IsString,
  IsOptional,
  ArrayNotEmpty,
  IsUUID,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

class PromotionCategoryItemDto {
  @ApiProperty({ example: 'category-uuid' })
  @IsUUID()
  @IsString()
  categoryId: string;

  @ApiProperty({ example: 'floor-uuid', required: false })
  @IsOptional()
  @IsUUID()
  @IsString()
  floorId?: string;

  @ApiProperty({ example: 'zone-uuid', required: false })
  @IsOptional()
  @IsUUID()
  @IsString()
  zoneId?: string;
}

export class BulkCreatePromotionCategoryDto {
  @ApiProperty({ type: [PromotionCategoryItemDto] })
  @IsArray()
  @ArrayNotEmpty()
  @ValidateNested({ each: true })
  @Type(() => PromotionCategoryItemDto)
  items: PromotionCategoryItemDto[];
}