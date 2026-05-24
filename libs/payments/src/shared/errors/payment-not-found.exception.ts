export class PaymentNotFoundException extends Error {
  constructor(paymentId: string) {
    super(`Payment with ID ${paymentId} not found`);
    this.name = 'PaymentNotFoundException';

    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, PaymentNotFoundException);
    }
  }
}
