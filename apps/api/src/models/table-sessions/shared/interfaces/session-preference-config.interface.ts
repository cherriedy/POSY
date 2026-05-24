/**
 * @description
 * This interface defines the structure of the session preference configuration object.
 * It includes limits for various aspects of the session preferences such as cuisines,
 * meal sessions, taste profiles, and dietary restrictions.
 *
 * @property {Object} limits - An object containing the limits for each preference category.
 * @property {number} limits.cuisines - The maximum number of cuisines to track in preferences.
 * @property {number} limits.mealSessions - The maximum number of meal sessions to track in preferences.
 * @property {number} limits.tasteProfile - The maximum number of taste profile attributes to track in preferences.
 * @property {number} limits.dietaryRestrictions - The maximum number of dietary restrictions to track in preferences.
 */
export interface SessionPreferenceConfig {
  limits: {
    cuisines: number;
    mealSessions: number;
    tasteProfile: number;
    dietaryRestrictions: number;
  };
}
