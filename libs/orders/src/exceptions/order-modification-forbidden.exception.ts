export class OrderModificationForbiddenException extends Error {
  constructor(
    message?: string,
    private readonly object?: any,
  ) {
    super(message ?? 'Order modification is forbidden');
    this.name = 'OrderModificationForbiddenException';
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, OrderModificationForbiddenException);
    }
  }
}
