import {
  PromotionApplicability,
  PromotionDiscountType,
  PromotionStatus,
} from '../enums';
import { PromotionUnusableException } from '../exceptions';

export class Promotion {
  constructor(
    public id: string | null,
    public code: string,
    public title: string,
    public description: string | null,
    public discountType: PromotionDiscountType,
    public discountValue: number,
    public maxDiscountAmount: number | null,
    public minOrderValue: number = 0,
    public applicability: PromotionApplicability,
    public minQuantity: number | null,
    public startAt: Date,
    public endAt: Date,
    public usageLimit: number | null,
    public version: number = 1,
    public status: PromotionStatus,
    public isStackable: boolean = false,
    public priority: number = 0,
    public isDeleted: boolean = false,
    public deletedAt: Date | null,
    public createdAt: Date,
    public updateAt: Date,

    public promotionProducts?: { product_id: string }[],
    public promotionCategories?: { category_id: string }[],
  ) { }

  /**
   * Calculates the discount amount for the promotion based on the subtotal amount.
   *
   * @param {number} subtotalAmount The subtotal amount of the order.
   * @returns {number} The calculated discount amount.
   */
  public calculate(subtotalAmount: number): number {
    const discountValue = this.discountValue ?? 0;

    if (this.discountType === PromotionDiscountType.PERCENTAGE) {
      const rawDiscount = subtotalAmount * (discountValue / 100);
      const maxDiscount = this.maxDiscountAmount;

      if (maxDiscount != null) {
        return Math.max(Math.min(rawDiscount, maxDiscount), 0);
      }

      return Math.max(rawDiscount, 0);
    }

    return Math.max(discountValue, 0);
  }

  /**
   * Asserts if the promotion is usable based on status, validity window and usage limit.
   *
   * @param usageCount Current number of redemptions already reserved/confirmed.
   * @throws {PromotionUnusableException} If the promotion is not usable.
   */
  public assertUsable(usageCount?: number): void {
    if (this.isDeleted || this.status !== PromotionStatus.ACTIVE) {
      throw new PromotionUnusableException(
        this.id ?? this.code,
        `Promotion "${this.code}" is not active`,
      );
    }

    const now = new Date();
    if (this.startAt > now || this.endAt < now) {
      throw new PromotionUnusableException(
        this.id ?? this.code,
        `Promotion "${this.code}" is outside its validity period`,
      );
    }

    if (
      this.usageLimit != null &&
      usageCount != null &&
      usageCount >= this.usageLimit
    ) {
      throw new PromotionUnusableException(
        this.id ?? this.code,
        `Promotion "${this.code}" has reached usage limit`,
        { usageCount, usageLimit: this.usageLimit },
      );
    }
  }
}
