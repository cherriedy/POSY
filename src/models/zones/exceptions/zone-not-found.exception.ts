export class ZoneNotFoundException extends Error {
  constructor(id: string) {
    super(`Zone with ID ${id} not found.`);
    this.name = 'ZoneNotFoundException';
  }
}

export class ZonesNotFoundException extends Error {
  missingIds?: string[];

  constructor(details?: { missingIds?: string[] }) {
    let message = 'One or more zones not found or deleted.';

    if (details?.missingIds?.length) {
      message += ` Missing IDs: ${details.missingIds.join(', ')}`;
    }

    super(message);

    this.name = 'ZonesNotFoundException';
    this.missingIds = details?.missingIds;
  }
}