export class PromotionProductNotFoundError extends Error {
  override readonly name = 'PromotionProductNotFoundError';

  constructor(
    public id: string,
    message = `PromotionProduct with ID: ${id} not found.`,
    public meta?: Record<string, any>,
  ) {
    super(message);
  }
}
