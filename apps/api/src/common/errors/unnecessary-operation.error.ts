export class UnnecessaryOperationError extends Error {
  override readonly name = 'UnnecessaryOperationError';
  public meta?: object;

  constructor(message: string, meta?: object) {
    super(message);
    this.meta = meta;
  }
}
