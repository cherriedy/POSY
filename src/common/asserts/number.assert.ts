import { ConstraintViolationException } from '../exceptions';

/**
 * Ensures that each value in `values` is strictly greater than
 * its corresponding value in `threshold`.
 *
 * Each key in `values` must exist in `threshold`.
 * Comparison is strict: value must be > threshold.
 *
 * @param values - Map of numeric values to validate.
 * @param threshold - Map of numeric threshold values.
 *
 * @throws ConstraintViolationException
 * Thrown if:
 * - A corresponding threshold is missing.
 * - A value is less than or equal to its threshold.
 */
export function assertLarger(
  values: Record<string, number>,
  threshold: Record<string, number>,
): void {
  for (const [key, value] of Object.entries(values)) {
    const tValue = threshold[key];

    if (tValue === undefined) {
      throw new ConstraintViolationException(
        `No threshold provided for ${key}.`,
      );
    }

    if (value <= tValue) {
      throw new ConstraintViolationException(
        `${key} must be larger than ${tValue}. Received: ${value}.`,
      );
    }
  }
}

/**
 * Ensures that each value in `values` is greater than or equal to zero.
 *
 * Zero is considered valid.
 *
 * @param values - Map of numeric values to validate.
 *
 * @throws ConstraintViolationException
 * Thrown if any value is negative.
 */
export function assertNonNegative(values: Record<string, number>): void {
  for (const [key, value] of Object.entries(values)) {
    if (value < 0) {
      throw new ConstraintViolationException(`${key} cannot be negative.`);
    }
  }
}

/**
 * Ensures that each value in `values` is a finite number.
 *
 * Rejects:
 * - NaN
 * - Infinity
 * - -Infinity
 *
 * @param values - Map of numeric values to validate.
 *
 * @throws ConstraintViolationException
 * Thrown if any value is not finite.
 */
export function assertFinite(values: Record<string, number>): void {
  for (const [key, value] of Object.entries(values)) {
    if (!Number.isFinite(value)) {
      throw new ConstraintViolationException(`${key} must be a finite number.`);
    }
  }
}

/**
 * Ensures that a value lies within the inclusive range [min, max].
 *
 * @param value - The numeric value to validate.
 * @param min - Minimum allowed value (inclusive).
 * @param max - Maximum allowed value (inclusive).
 *
 * @throws ConstraintViolationException
 * Thrown if the value is outside the specified range.
 */
export function assertInRange(value: number, min: number, max: number): void {
  if (value < min || value > max) {
    throw new ConstraintViolationException(
      `Value must be between ${min} and ${max}.`,
    );
  }
}

/**
 * Ensures that each value in `values` is strictly greater than zero.
 *
 * Zero is considered invalid.
 *
 * @param values - Map of numeric values to validate.
 *
 * @throws ConstraintViolationException
 * Thrown if any value is less than or equal to zero.
 */
export function assertPositive(values: Record<string, number>): void {
  for (const [key, value] of Object.entries(values)) {
    if (value <= 0) {
      throw new ConstraintViolationException(
        `${key} must be a positive number.`,
      );
    }
  }
}
