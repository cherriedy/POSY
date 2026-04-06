import { DietaryTag, MealSession, Taste } from '../../../products';

/**
 * @description
 * Represents the preferences and historical data associated with a specific session.
 * This includes dietary restrictions, favorite cuisines, and taste profiles to provide personalized recommendations.
 *
 * @class SessionPreference
 * @property {string | null} id - The unique identifier for the session preference
 * @property {string} sessionId - The ID of the associated table session
 * @property {string[]} favoriteCuisines - A list of preferred cuisine types
 * @property {MealSession[]} favoriteMealSessions - Preferred meal times (e.g., Breakfast, Dinner)
 * @property {Taste[]} favoriteTasteProfile - Preferred taste characteristics
 * @property {DietaryTag[]} dietaryRestrictions - List of dietary constraints or allergies
 * @property {number | null} avgSpicePreference - The average spice level preferred (numeric scale)
 * @property {number | null} avgPriceRange - The average price range preferred
 * @property {number} orderCount - Total number of orders placed in this session
 * @property {Date | null} lastOrderDate - The timestamp of the most recent order
 * @property {Date} createdAt - The timestamp when the preference record was created
 * @property {Date} updatedAt - The timestamp when the preference record was last updated
 */
export class SessionPreference {
  constructor(
    public id: string | null,
    public sessionId: string,
    public favoriteCuisines: string[],
    public favoriteMealSessions: MealSession[],
    public favoriteTasteProfile: Taste[],
    public dietaryRestrictions: DietaryTag[],
    public avgSpicePreference: number | null,
    public avgPriceRange: number | null,
    public orderCount: number,
    public lastOrderDate: Date | null,
    public createdAt: Date = new Date(),
    public updatedAt: Date = new Date(),
  ) {}
}
