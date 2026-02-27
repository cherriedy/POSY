export class ProductNotFoundException extends Error {
  constructor(id: string) {
    super(`Product with ID ${id} not found.`);
    this.name = 'ProductNotFoundException';
  }
}

export class ProductsNotFoundException extends Error {
  missingIds?: string[];

  constructor(details?: { missingIds?: string[] }) {
    let message = 'One or more products not found or deleted.';

    if (details?.missingIds?.length) {
      message += ` Missing IDs: ${details.missingIds.join(', ')}`;
    }

    super(message);

    this.name = 'ProductsNotFoundException';
    this.missingIds = details?.missingIds;
  }
}
