import { MealSession, Taste, DietaryTag, Season } from '../enums';
import { Cuisine } from '../../cuisines/types';

/**
 * ProductAttribute domain entity for content-based filtering in recommendations.
 *
 * Represents detailed attributes about a product to support recommendation algorithms.
 *
 * @property {string | null} id Unique identifier
 * @property {string | null} cuisineId Associated cuisine ID
 * @property {string} productId Product this attribute belongs to
 * @property {MealSession | null} mealSession When this product is typically consumed
 * @property {Taste[]} tasteProfile Taste profile tags
 * @property {DietaryTag[]} dietaryTags Dietary restriction tags
 * @property {number | null} preparationTime Preparation time in minutes
 * @property {number | null} spiceLevel Spice level on a 0-5 scale
 * @property {boolean} isSeasonal Whether the product is seasonal
 * @property {Season | null} season Season when available, if seasonal
 * @property {Date | null} createdAt Creation timestamp
 * @property {Date | null} updatedAt Last update timestamp
 * @property {Cuisine | null} cuisine Optional relation to Cuisine
 */
export class ProductAttribute {
  constructor(
    public id: string | undefined,
    public productId: string,
    public cuisineId: string | null = null,
    public mealSession: MealSession | null = null,
    public tasteProfile: Taste[] = [],
    public dietaryTags: DietaryTag[] = [],
    public preparationTime: number | null = null,
    public spiceLevel: number | null = null,
    public isSeasonal: boolean = false,
    public season: Season | null = null,
    public createdAt: Date | null = null,
    public updatedAt: Date | null = null,
    // Relations
    public cuisine: Cuisine | null = null,
  ) {}
}
