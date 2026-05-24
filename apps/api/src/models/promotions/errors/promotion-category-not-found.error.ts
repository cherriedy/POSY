export class PromotionCategoryNotFoundError extends Error {
  override readonly name = 'PromotionCategoryNotFoundError';

  constructor(
    public readonly id?: string,
    message = `PromotionCategory with ID: ${id} not found.`,
    public readonly meta?: Record<string, any>,
  ) {
    super(message);
  }
}
