export class TableTokenInvalidException extends Error {
  constructor(tableId: string) {
    super(`Invalid token for table ${tableId}.`);
    this.name = 'TableTokenInvalidException';

    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, TableTokenInvalidException);
    }
  }
}
