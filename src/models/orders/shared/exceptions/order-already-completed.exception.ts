export class OrderAlreadyCompletedException extends Error {
  constructor(orderId: string) {
    super(
      `Order "${orderId}" is already completed or cancelled and cannot be modified.`,
    );
    this.name = 'OrderAlreadyCompletedException';
  }
}
