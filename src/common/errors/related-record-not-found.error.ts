export class RelatedRecordNotFoundError extends Error {
  override readonly name = 'RelatedRecordNotFoundError';
  fields?: any[];

  constructor(message?: string, fields?: any[]) {
    super(message ?? 'Relevant related record not found.');
    this.fields = fields;
  }
}
