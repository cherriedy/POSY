/**
 * @description Exception thrown when there is insufficient stock of a required ingredient for an order.
 * This exception includes details about the ingredient, the required quantity, and the available stock.
 *
 * @class InsufficientRequiredIngredientException
 * @extends {Error}
 *
 * @example
 * ```TypeScript
 * const required = 5;
 * const available = 3;
 * if (available < required) {
 *   throw new InsufficientRequiredIngredientException('Tomato', '123', required, available);
 * }
 * ```
 */
export class InsufficientRequiredIngredientException extends Error {
  constructor(
    name: string,
    readonly id: string,
    readonly required: number,
    readonly available: number,
  ) {
    super(
      `Insufficient stock for ${name}: need ${required}, have ${available}`,
    );
    this.name = 'InsufficientRequiredIngredientException';
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, InsufficientRequiredIngredientException);
    }
  }
}
