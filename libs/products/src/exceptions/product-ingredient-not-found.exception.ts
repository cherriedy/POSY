export class ProductIngredientNotFoundException extends Error {
  constructor(message?: string) {
    super(message ?? 'Product ingredient not found.');
    this.name = 'ProductIngredientNotFoundException';

    // Maintains proper stack trace for where our error was thrown
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, ProductIngredientNotFoundException);
    }
  }
}
