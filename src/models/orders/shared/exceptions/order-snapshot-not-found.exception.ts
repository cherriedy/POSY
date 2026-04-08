export class OrderSnapshotNotFoundException extends Error {
  constructor(orderId: string) {
    super(
      `No pricing snapshot found for order "${orderId}". Call generateSnapshot first.`,
    );
    this.name = 'OrderSnapshotNotFoundException';
  }
}
