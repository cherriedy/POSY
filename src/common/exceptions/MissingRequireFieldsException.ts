export class MissingRequireFieldsException extends Error {
  fields?: string[];
  constructor(fields?: string[]) {
    super('Required fields are missing');
    this.fields = fields;
    this.name = 'MissingRequireFieldsException';

    // Maintains proper stack trace for where our error was thrown
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, MissingRequireFieldsException);
    }
  }
}
