export class TaxAssociationNotFoundException extends Error {
  constructor(details?: { id?: string }) {
    const message = details?.id
      ? `Entity-tax association with ID: ${details.id} not found.`
      : 'Entity-tax association not found.';
    super(message);
    this.name = 'TaxAssociationNotFoundException';
  }
}
