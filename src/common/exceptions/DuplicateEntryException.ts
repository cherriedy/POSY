export class DuplicateEntryException extends Error {
  details: object;

  constructor(message: string, details: object = {}) {
    super(message);
    this.details = details;
    this.name = 'DuplicateEntryException';

    // Maintains proper stack trace for where our error was thrown
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, DuplicateEntryException);
    }
  }
}
