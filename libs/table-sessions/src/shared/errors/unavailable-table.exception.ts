export class UnavailableTableException extends Error {
  constructor(tableId: string) {
    super(`Table with ID ${tableId} is currently unavailable`);
    this.name = 'UnavailableTableException';
  }
}
