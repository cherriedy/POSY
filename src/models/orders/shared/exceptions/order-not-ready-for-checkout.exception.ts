export class OrderNotReadyForCheckoutException extends Error {
  constructor() {
    super('Order must be SERVED before checkout');
    this.name = 'OrderNotReadyForCheckoutException';
  }
}
