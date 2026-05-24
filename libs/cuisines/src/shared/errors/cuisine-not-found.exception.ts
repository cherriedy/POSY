/**
 * Exception thrown when a requested cuisine cannot be found.
 */
export class CuisineNotFoundException extends Error {
  constructor(identifier: string) {
    super(`Cuisine with identifier "${identifier}" not found`);
    this.name = 'CuisineNotFoundException';
  }
}
