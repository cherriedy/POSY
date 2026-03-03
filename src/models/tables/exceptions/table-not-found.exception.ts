export class TableNotFoundException extends Error {
  constructor(id: string) {
    super(`Table with ID ${id} not found.`);
    this.name = 'TableNotFoundException';

    // Maintains proper stack trace for where our error was thrown
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, TableNotFoundException);
    }
  }
}
