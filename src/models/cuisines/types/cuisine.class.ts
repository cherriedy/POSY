/**
 * Cuisine domain entity representing a culinary tradition or regional food style.
 *
 * Used in the recommendation system to categorize products by cuisine type
 * and help understand user preferences based on their cuisine choices.
 */
export class Cuisine {
  constructor(
    public id: string | null,
    public name: string,
    public region: string | null,
    public createdAt: Date | null,
    public updatedAt: Date | null,
    public isDeleted: boolean,
    public deletedAt: Date | null,
  ) {}
}
