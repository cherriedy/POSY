export class InvalidTaxEntityCombinationException extends Error {
  constructor(details?: { taxType?: string; entityType?: string }) {
    let message = 'This tax type cannot be associated with this entity type.';
    if (details?.taxType && details?.entityType) {
      message = `Tax type ${details.taxType} cannot be associated with entity type ${details.entityType}.`;
    }
    super(message);
    this.name = 'InvalidTaxEntityCombinationException';
  }
}
