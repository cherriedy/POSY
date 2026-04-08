export class IngredientNotFoundException extends Error {
  constructor(id: string) {
    super(`Ingredient with ID ${id} not found.`);
    this.name = 'IngredientNotFoundException';
    // Maintains proper stack trace for where our error was thrown (only available on V8)
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, IngredientNotFoundException);
    }
  }
}
