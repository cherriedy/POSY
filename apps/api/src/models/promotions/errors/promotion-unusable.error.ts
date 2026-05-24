export class PromotionUnusableError extends Error {
  override readonly name = 'PromotionUnusableError';

  constructor(
    public id: string,
    message = `Promotion with ID ${id} is unusable.`,
    public meta?: Record<string, any>,
  ) {
    super(message);
  }
}
