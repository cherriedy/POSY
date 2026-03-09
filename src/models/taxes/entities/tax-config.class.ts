import {
  assertFinite,
  assertLarger,
  assertNonNegative,
} from '../../../common/asserts/number.assert';
import { TaxRateType, TaxType } from '../enums';
import { UnsupportedValueException } from '../../../common/exceptions';
import { roundToCurrency } from '../../../common/utilities/number.util';
import { OrderTax, PricingSnapshotTax } from '@prisma/client';

export class TaxConfig {
  constructor(
    public id: string | null,
    public type: TaxType,
    public name: string,
    public description: string | null,
    public rateType: TaxRateType,
    public chargeRate: number,
    public isActive: boolean = true,
    public isIncluded: boolean = false,
    public sortOrder: number = 0,
    public isDeleted: boolean = false,
    public deletedAt: Date | null = null,
    public createdAt: Date | null,
    public updatedAt: Date | null,
    // Relations
    public orderTaxes: OrderTax[] | null,
    public pricingSnapshotTaxes: PricingSnapshotTax[] | null,
  ) {}

  /**
   * Calculates a tax amount based on the provided rate configuration.
   *
   * The calculation flow is:
   * 1. Validate numeric inputs (must be finite and non-negative).
   * 2. Validate optional minimum and maximum constraints.
   * 3. Compute the raw tax amount based on the rate type.
   * 4. Clamp the result to the provided bounds (if any).
   * 5. Round the final amount to currency precision.
   *
   * @param rateType - The tax rate calculation strategy (percentage, fixed, per-unit).
   * @param chargeRate - The numeric tax rate or fixed amount.
   * @param subtotal - The base monetary amount used for percentage calculations.
   * @param quantity - The quantity used for per-unit calculations.
   * @param min - Optional minimum tax amount allowed.
   * @param max - Optional maximum tax amount allowed.
   *
   * @returns The final tax amount rounded to currency precision.
   *
   * @throws ConstraintViolationException
   * Thrown when:
   * - Any numeric input is negative
   * - Any numeric input is not finite
   * - `min` or `max` are invalid
   * - `min` is greater than `max`
   *
   * @throws UnsupportedValueException
   * Thrown when an unsupported `rateType` is provided.
   */
  static calculate(
    rateType: TaxRateType,
    chargeRate: number,
    subtotal: number,
    quantity?: number,
    min?: number,
    max?: number,
  ): number {
    // Validate numeric inputs
    this.assertNonNegativeFinite({ chargeRate, subtotal });
    if (rateType === TaxRateType.PER_UNIT) {
      if (quantity === undefined) {
        throw new UnsupportedValueException(
          'quantity',
          'Quantity is required for PER_UNIT tax rate type.',
        );
      }
      this.assertNonNegativeFinite({ quantity });
    }
    this.assertOptionalBounds(min, max);

    const rawAmount = this.computeAmount(
      rateType,
      chargeRate,
      subtotal,
      quantity,
    );

    const clampedAmount = this.clamp(rawAmount, min, max);
    return roundToCurrency(clampedAmount);
  }

  /**
   * Computes the raw tax amount before clamping and rounding.
   *
   * This method performs no validation. It assumes all inputs
   * have already been validated.
   *
   * @param rateType - The calculation strategy.
   * @param chargeRate - The rate or fixed amount.
   * @param subtotal - The base amount for percentage calculations.
   * @param quantity - The quantity for per-unit calculations.
   *
   * @returns The unrounded, unclamped tax amount.
   *
   * @throws UnsupportedValueException
   * Thrown if the provided rate type is not supported.
   */
  private static computeAmount(
    rateType: TaxRateType,
    chargeRate: number,
    subtotal: number,
    quantity?: number,
  ): number {
    switch (rateType) {
      case TaxRateType.PERCENTAGE:
        return (subtotal * chargeRate) / 100;

      case TaxRateType.FIXED_AMOUNT:
        return chargeRate;

      case TaxRateType.PER_UNIT:
        return chargeRate * quantity!;

      default:
        throw new UnsupportedValueException(
          rateType,
          'Unsupported tax rate type provided.',
        );
    }
  }

  /**
   * Ensures that all provided numeric values are:
   * - Finite numbers
   * - Non-negative
   *
   * Delegates validation logic to shared assertion utilities.
   *
   * @param values - A key-value map of numeric fields to validate.
   *
   * @throws ConstraintViolationException
   * If any value is negative or not finite.
   */
  private static assertNonNegativeFinite(values: Record<string, number>): void {
    assertNonNegative(values);
    assertFinite(values);
  }

  /**
   * Validates optional minimum and maximum bounds.
   *
   * Ensures:
   * - `min` (if provided) is non-negative
   * - `max` (if provided) is non-negative
   * - `max` is greater than or equal to `min`
   *
   * @param min - Optional minimum allowed value.
   * @param max - Optional maximum allowed value.
   *
   * @throws ConstraintViolationException
   * If bounds are invalid or logically inconsistent.
   */
  private static assertOptionalBounds(min?: number, max?: number): void {
    if (min !== undefined) assertNonNegative({ min });
    if (max !== undefined) assertNonNegative({ max });
    if (min !== undefined && max !== undefined) assertLarger({ max }, { min });
  }

  /**
   * Restricts a numeric value within optional lower and upper bounds.
   *
   * @param value - The numeric value to clamp.
   * @param min - Optional minimum bound.
   * @param max - Optional maximum bound.
   *
   * @returns:
   * - `min` if value is less than min
   * - `max` if value is greater than max
   * - Otherwise, the original value
   */
  private static clamp(value: number, min?: number, max?: number): number {
    if (min !== undefined && value < min) return min;
    if (max !== undefined && value > max) return max;
    return value;
  }
}
