export class DuplicateEntityTaxAssociationException extends Error {
  constructor(details?: {
    taxId?: string;
    entityType?: string;
    entityId?: string;
  }) {
    let message = 'This entity-tax association already exists.';
    if (details) {
      message = `Association between tax ID: ${details.taxId}, \n      entity type: ${details.entityType}, \n      and entity ID: ${details.entityId} already exists.`;
    }
    super(message);
    this.name = 'DuplicateEntityTaxAssociationException';
  }
}
