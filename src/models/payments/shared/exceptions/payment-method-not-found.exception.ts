export class PaymentMethodNotFoundException extends Error {
  constructor(id: string) {
    super(`Payment method with ID ${id} not found.`);
    this.name = 'PaymentMethodNotFoundException';

    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, PaymentMethodNotFoundException);
    }
  }
}
