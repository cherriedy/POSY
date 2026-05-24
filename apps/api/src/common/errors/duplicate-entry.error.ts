export class DuplicateEntryError extends Error {
  override readonly name = 'DuplicateEntryError';
  details: object;

  constructor(message: string, details: object = {}) {
    super(message);
    this.details = details;
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, DuplicateEntryError);
    }
  }
}
