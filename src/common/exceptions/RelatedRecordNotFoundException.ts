export class RelatedRecordNotFoundException extends Error {
  fields?: any[];

  constructor(message?: string, fields?: any[]) {
    super(message ?? 'Relevant related record not found.');
    this.fields = fields;
    this.name = 'RelatedRecordNotFoundException';
  }
}
