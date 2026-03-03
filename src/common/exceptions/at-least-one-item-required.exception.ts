export class AtLeastOneItemRequiredException extends Error {
  constructor(message: string = 'At least one item is required') {
    super(message);
    this.name = 'AtLeastOneItemRequiredException';

    // Maintains proper stack trace for where our error was thrown
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, AtLeastOneItemRequiredException);
    }
  }
}
