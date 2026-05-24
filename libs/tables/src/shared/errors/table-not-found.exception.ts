export class TableNotFoundException extends Error {
  constructor(id: string) {
    super(`Table with ID ${id} not found.`);
    this.name = 'TableNotFoundException';

    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, TableNotFoundException);
    }
  }
}

export class TableTokenInvalidException extends Error {
  constructor(tableId: string) {
    super(`Invalid token for table ${tableId}.`);
    this.name = 'TableTokenInvalidException';

    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, TableTokenInvalidException);
    }
  }
}
