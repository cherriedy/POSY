/**
 * Rounds a number to two decimal places, suitable for currency values.
 * Handles floating point precision issues.
 *
 * @param {number} value - The number to round.
 * @returns {number} The rounded number with two decimal places.
 */
export function roundToCurrency(value: number): number {
  return Math.round((value + Number.EPSILON) * 100) / 100;
}
