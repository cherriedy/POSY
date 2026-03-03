export class ProductNotFoundException extends Error {
  constructor(id: string) {
    super(`Product with ID ${id} not found.`);
    this.name = 'ProductNotFoundException';

    // Maintains proper stack trace for where our error was thrown
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, ProductNotFoundException);
    }
  }
}
