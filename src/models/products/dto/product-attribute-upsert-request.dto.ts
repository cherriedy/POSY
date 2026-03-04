import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsOptional,
  IsString,
  IsArray,
  IsEnum,
  IsInt,
  IsBoolean,
  Min,
  Max,
} from 'class-validator';
import { MealSession, Taste, DietaryTag, Season } from '../enums';
import { RequiredWhen } from '../../../common/decorators';

/**
 * DTO for creating or updating product attributes.
 */
export class ProductAttributeUpsertRequestDto {
  @ApiPropertyOptional({
    description: 'Cuisine ID',
    example: 'c1a2b3d4-5678-90ab-cdef-1234567890ab',
    nullable: true,
  })
  @IsOptional()
  @IsString()
  cuisineId: string | null;

  @ApiPropertyOptional({
    description: 'Meal session when product is typically consumed',
    enum: MealSession,
    example: MealSession.LUNCH,
    nullable: true,
  })
  @IsOptional()
  @IsEnum(MealSession)
  mealSession: MealSession | null;

  @ApiPropertyOptional({
    description: 'Taste profile tags',
    enum: Taste,
    isArray: true,
    example: [Taste.SPICY, Taste.SALTY],
    nullable: true,
  })
  @IsOptional()
  @IsArray()
  @IsEnum(Taste, { each: true })
  tasteProfile: Taste[] | null;

  @ApiPropertyOptional({
    description: 'Dietary restriction tags',
    enum: DietaryTag,
    isArray: true,
    example: [DietaryTag.HALAL, DietaryTag.GLUTEN_FREE],
    nullable: true,
  })
  @IsOptional()
  @IsArray()
  @IsEnum(DietaryTag, { each: true })
  dietaryTags: DietaryTag[] | null;

  @ApiPropertyOptional({
    description: 'Preparation time in minutes',
    example: 15,
    minimum: 1,
    maximum: 999,
    nullable: true,
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(999)
  preparationTime: number | null;

  @ApiPropertyOptional({
    description: 'Spice level (0-5 scale)',
    example: 3,
    minimum: 0,
    maximum: 5,
    nullable: true,
  })
  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(5)
  spiceLevel: number | null;

  @ApiPropertyOptional({
    description: 'Whether the product is seasonal',
    example: false,
    default: false,
    nullable: true,
  })
  @IsOptional()
  @IsBoolean()
  isSeasonal: boolean | null;

  @ApiPropertyOptional({
    description: 'Season when available (if seasonal)',
    enum: Season,
    example: Season.SUMMER,
    nullable: true,
  })
  @IsOptional()
  @IsEnum(Season)
  @RequiredWhen('isSeasonal', {
    message: 'Season must be provided when product is seasonal',
  })
  season: Season | null;
}
