export class OrderNotFoundForSessionException extends Error {
  constructor(sessionId: string) {
    super(`No order found for session ID "${sessionId}"`);
    this.name = 'OrderNotFoundWithProvidedSessionException';
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, OrderNotFoundForSessionException);
    }
  }
}
