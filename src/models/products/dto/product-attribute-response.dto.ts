import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Exclude, Expose, Type } from 'class-transformer';
import { DietaryTag, MealSession, Season, Taste } from '../enums';
import { ProductAttributeCuisineResponseDto } from './product-attribute-cuisine-response.dto';

/**
 * Response DTO for product attributes.
 */
@Exclude()
export class ProductAttributeResponseDto {
  @ApiProperty({
    description: 'Product attribute ID',
    example: 'a1b2c3d4-5678-90ab-cdef-1234567890ab',
  })
  @Expose()
  id: string;

  @ApiPropertyOptional({
    description: 'Meal session',
    enum: MealSession,
    example: MealSession.LUNCH,
    nullable: true,
  })
  @Expose()
  mealSession: MealSession | null;

  @ApiProperty({
    description: 'Taste profile tags',
    enum: Taste,
    isArray: true,
    example: [Taste.SPICY, Taste.SALTY],
  })
  @Expose()
  tasteProfile: Taste[];

  @ApiProperty({
    description: 'Dietary restriction tags',
    enum: DietaryTag,
    isArray: true,
    example: [DietaryTag.HALAL],
  })
  @Expose()
  dietaryTags: DietaryTag[];

  @ApiPropertyOptional({
    description: 'Preparation time in minutes',
    example: 15,
    nullable: true,
  })
  @Expose()
  preparationTime: number | null;

  @ApiPropertyOptional({
    description: 'Spice level (0-5)',
    example: 3,
    nullable: true,
  })
  @Expose()
  spiceLevel: number | null;

  @ApiProperty({
    description: 'Whether the product is seasonal',
    example: false,
  })
  @Expose()
  isSeasonal: boolean;

  @ApiPropertyOptional({
    description: 'Season when available',
    enum: Season,
    example: Season.SUMMER,
    nullable: true,
  })
  @Expose()
  season: Season | null;

  @ApiProperty({
    description: 'Cuisine information',
    type: () => ProductAttributeCuisineResponseDto,
  })
  @Expose()
  @Type(() => ProductAttributeCuisineResponseDto)
  cuisine: ProductAttributeCuisineResponseDto;
}
