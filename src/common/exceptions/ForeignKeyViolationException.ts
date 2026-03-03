export class ForeignKeyViolationException extends Error {
  details: object;

  constructor(details: object = {}) {
    super('Foreign key violation occurred.');
    this.details = details;
    this.name = 'ForeignKeyViolationException';

    // Maintains proper stack trace for where our error was thrown
    // (only available on V8 engines)
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, ForeignKeyViolationException);
    }
  }
}
