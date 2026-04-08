import { Inject, Injectable, Logger } from '@nestjs/common';
import { OrderItem } from '../../../orders';
import { MealSession, ProductAttribute } from '../../../products';
import { SessionPreferenceRepository } from '../../shared';
import { SessionPreference } from '../../shared';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';
import { TableSessionConfig } from '../../table-session.config';
import * as math from 'mathjs';
import { ProductAttributeRepository } from '../../../products/repositories/product-attribute-repository.abstract';

@Injectable()
export class RecordPreferenceService {
  @Inject(WINSTON_MODULE_NEST_PROVIDER)
  private readonly logger: Logger;

  constructor(
    private readonly sessionPreferenceRepository: SessionPreferenceRepository,
    private readonly productAttributeRepository: ProductAttributeRepository,
    private readonly config: TableSessionConfig,
  ) {}

  /**
   * Records or updates session preferences based on the items in a given order.
   *
   * @param sessionId - The ID of the session to update.
   * @param orderItems - The items from the newly created order.
   *
   * @remarks
   * This is a "fire-and-forget" operation; it logs errors but does not throw them,
   * ensuring that preference recording failures do not interrupt the main order creation flow.
   */
  async execute(sessionId: string, orderItems: OrderItem[]): Promise<void> {
    try {
      const productAttributes = await this.getProductAttributes(orderItems);
      if (productAttributes.length === 0) {
        this.logger.log(
          `No product attributes were found for the order items in 
          session ${sessionId}. Preference update has been skipped.`,
        );
        return;
      }

      const existing =
        await this.sessionPreferenceRepository.findBySessionId(sessionId);

      if (existing) {
        const updatedData = this.buildUpdatedPreference(
          existing,
          productAttributes,
          orderItems,
        );
        await this.sessionPreferenceRepository.updateBySessionId(
          sessionId,
          updatedData,
        );
      } else {
        const newPreference = this.buildNewPreference(
          sessionId,
          productAttributes,
          orderItems,
        );
        await this.sessionPreferenceRepository.create(newPreference);
      }
    } catch (e) {
      if (e instanceof Error) {
        this.logger.error(
          `Failed to record session preferences for session ${sessionId}`,
          e.stack,
        );
      }
    }
  }

  /**
   * Fetches product attributes for the given order items.
   * @param orderItems - An array of order items.
   * @returns A promise that resolves to an array of ProductAttribute.
   */
  private async getProductAttributes(
    orderItems: OrderItem[],
  ): Promise<ProductAttribute[]> {
    return Promise.all(
      orderItems.map((oi) =>
        this.productAttributeRepository.findByProductId(oi.productId),
      ),
    ).then((attrs) => attrs.filter((attr) => attr !== null));
  }

  /**
   * Constructs the data payload for updating an existing `SessionPreference`.
   *
   * @param existingPreference - The existing session preference to update.
   * @param productAttributes - Product attributes associated with the new order items.
   * @param orderItems - The new order items.
   * @returns A partial SessionPreference object with updated fields.
   */
  private buildUpdatedPreference(
    existingPreference: SessionPreference,
    productAttributes: ProductAttribute[],
    orderItems: OrderItem[],
  ): Partial<SessionPreference> {
    const existingOrderCount = existingPreference.orderCount;
    const newOrderCount = existingOrderCount + 1;

    const newAvgPrice = this.calculateAveragePrice(orderItems);
    const avgPriceRange =
      existingPreference.avgPriceRange !== null
        ? (existingPreference.avgPriceRange * existingOrderCount +
            newAvgPrice) /
          newOrderCount
        : newAvgPrice;

    const newAvgSpicePreference =
      this.calculateAverageSpiceLevel(productAttributes);
    let avgSpicePreference = existingPreference.avgSpicePreference;

    if (newAvgSpicePreference !== null) {
      const calculatedAvgSpice =
        existingPreference.avgSpicePreference !== null
          ? (existingPreference.avgSpicePreference * existingOrderCount +
              newAvgSpicePreference) /
            newOrderCount
          : newAvgSpicePreference;
      avgSpicePreference = this.normalizeSpiceLevel(calculatedAvgSpice);
    }

    const favoriteCuisines = this.getScoredValues(
      productAttributes
        .map((attr) => attr.cuisineId)
        .filter((cuisineId) => typeof cuisineId === 'string'),
      existingPreference.favoriteCuisines,
      this.config.preferences.limits.cuisines,
    );
    const favoriteMealSessions = this.getScoredValues(
      productAttributes.map((attr) => attr.mealSession).filter(Boolean),
      existingPreference.favoriteMealSessions,
      this.config.preferences.limits.mealSessions,
    ) as MealSession[];
    const favoriteTasteProfile = this.getScoredValues(
      productAttributes.flatMap((attr) => attr.tasteProfile),
      existingPreference.favoriteTasteProfile,
      this.config.preferences.limits.tasteProfile,
    );
    const dietaryRestrictions = this.getScoredValues(
      productAttributes.flatMap((attr) => attr.dietaryTags),
      existingPreference.dietaryRestrictions,
      this.config.preferences.limits.dietaryRestrictions,
    );

    return {
      favoriteCuisines,
      favoriteMealSessions,
      favoriteTasteProfile,
      dietaryRestrictions,
      avgSpicePreference,
      avgPriceRange,
      orderCount: newOrderCount,
      lastOrderDate: new Date(),
    };
  }

  /**
   * Builds a new `SessionPreference` entity from scratch.
   *
   * @param sessionId - The ID of the session for which to create a new preference.
   * @param productAttributes - Product attributes associated with the order items.
   * @param orderItems - The order items from which to derive preferences.
   * @returns A new SessionPreference object.
   */
  private buildNewPreference(
    sessionId: string,
    productAttributes: ProductAttribute[],
    orderItems: OrderItem[],
  ): SessionPreference {
    const avgPriceRange = this.calculateAveragePrice(orderItems);
    const avgSpicePreference = this.normalizeSpiceLevel(
      this.calculateAverageSpiceLevel(productAttributes),
    );

    const favoriteCuisines = this.getScoredValues(
      productAttributes
        .map((attr) => attr.cuisineId)
        .filter((cuisineId) => typeof cuisineId === 'string'),
      [],
      this.config.preferences.limits.cuisines,
    );
    const favoriteMealSessions = this.getScoredValues(
      productAttributes.map((attr) => attr.mealSession).filter(Boolean),
      [],
      this.config.preferences.limits.mealSessions,
    ) as MealSession[];
    const favoriteTasteProfile = this.getScoredValues(
      productAttributes.flatMap((attr) => attr.tasteProfile),
      [],
      this.config.preferences.limits.tasteProfile,
    );
    const dietaryRestrictions = this.getScoredValues(
      productAttributes.flatMap((attr) => attr.dietaryTags),
      [],
      this.config.preferences.limits.dietaryRestrictions,
    );

    return new SessionPreference(
      null,
      sessionId,
      favoriteCuisines,
      favoriteMealSessions,
      favoriteTasteProfile,
      dietaryRestrictions,
      avgSpicePreference,
      avgPriceRange,
      1,
      new Date(),
      new Date(),
      new Date(),
    );
  }

  /**
   * Calculates the average price of items in an order.
   *
   * @param orderItems - An array of order items.
   * @returns The average price of the order items.
   */
  private calculateAveragePrice(orderItems: OrderItem[]): number {
    if (orderItems.length === 0) return 0;
    const totalSpent = orderItems.reduce(
      (sum, orderItem) => sum + orderItem.subtotal,
      0,
    );
    return totalSpent / orderItems.length;
  }

  /**
   * Calculates the average spice level based on product attributes.
   *
   * @param productAttributes - An array of product attributes.
   * @returns The average spice level, or null if no spice levels are present.
   */
  private calculateAverageSpiceLevel(
    productAttributes: ProductAttribute[],
  ): number | null {
    const spiceLevels = productAttributes
      .map((attr) => attr.spiceLevel)
      .filter((level) => level !== null && level !== undefined);

    if (spiceLevels.length === 0) return null;

    const totalSpice = spiceLevels.reduce((sum, level) => sum + level, 0);
    return totalSpice / spiceLevels.length;
  }

  /**
   * Normalizes the given spice level to ensure it falls within the 0-5 scale using mathjs.
   *
   * @param level - The calculated spice level.
   * @returns The normalized spice level bounded between 0 and 5.
   */
  private normalizeSpiceLevel(level: number | null): number | null {
    return level ? Number(math.max(0, math.min(5, level))) : null;
  }

  /**
   * Counts frequencies of values and returns an array of the most common ones sorted by frequency.
   *
   * @param newValues - An array of new values to include in the frequency count.
   * @param existingValues - An array of existing values to include in the frequency count.
   * @param limit - The maximum number of top values to return.
   * @returns A new array containing the top unique values sorted by frequency.
   */
  private getScoredValues<T>(
    newValues: T[],
    existingValues: T[] = [],
    limit: number = 3,
  ): T[] {
    const frequency = new Map<T, number>(); // Map to count occurrences of each value
    const combined = [...existingValues, ...newValues.filter((v) => v)];

    for (const value of combined) {
      frequency.set(value, (frequency.get(value) || 0) + 1);
    }

    return Array.from(frequency.entries())
      .sort((a, b) => b[1] - a[1])
      .map(([value]) => value)
      .slice(0, limit);
  }
}
