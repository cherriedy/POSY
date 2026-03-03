export class FloorNotFoundException extends Error {
  constructor(id: string) {
    super(`Floor with ID ${id} not found.`);
    this.name = 'FloorNotFoundException';
  }
}

export class FloorsNotFoundException extends Error {
  missingIds?: string[];

  constructor(details?: { missingIds?: string[] }) {
    let message = 'One or more floors not found or deleted.';

    if (details?.missingIds?.length) {
      message += ` Missing IDs: ${details.missingIds.join(', ')}`;
    }

    super(message);

    this.name = 'FloorsNotFoundException';
    this.missingIds = details?.missingIds;
  }
}