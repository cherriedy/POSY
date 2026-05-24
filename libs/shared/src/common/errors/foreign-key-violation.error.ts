export class ForeignKeyViolationError extends Error {
  override readonly name = 'ForeignKeyViolationError';
  details: object;

  constructor(details: object = {}) {
    super('Foreign key violation occurred.');
    this.details = details;
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, ForeignKeyViolationError);
    }
  }
}
