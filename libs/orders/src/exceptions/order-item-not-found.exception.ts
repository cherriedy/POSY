export class OrderItemNotFoundException extends Error {
  constructor(itemId: string, message?: string) {
    super(message ? message : `Order item with ID ${itemId} not found.`);
    this.name = 'OrderItemNotFoundException';
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, OrderItemNotFoundException);
    }
  }
}
