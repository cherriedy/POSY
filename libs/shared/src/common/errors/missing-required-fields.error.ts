export class MissingRequiredFieldsError extends Error {
  override readonly name = 'MissingRequiredFieldsError';
  fields?: string[];

  constructor(fields?: string[]) {
    super('Required fields are missing');
    this.fields = fields;
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, MissingRequiredFieldsError);
    }
  }
}
