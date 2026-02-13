export class TaxNotFoundException extends Error {
  constructor(details?: { id?: string; name?: string }) {
    const placeholder = details && (details.id || details.name) ? 'with ' : '';
    let message = `Tax configuration ${placeholder}`;
    if (details?.id) message += `ID: ${details.id} `;
    if (details?.name) message += `Name: ${details.name} `;
    message += 'not found.';
    super(message);
    this.name = 'TaxNotFoundException';
  }
}
