export class CategoryNotFoundException extends Error {
  constructor(id: string) {
    super(`Category with ID ${id} not found.`);
    this.name = 'CategoryNotFoundException';
  }
}

export class CategoriesNotFoundException extends Error {
  missingIds?: string[];

  constructor(details?: { missingIds?: string[] }) {
    let message = 'One or more categories not found or deleted.';

    if (details?.missingIds?.length) {
      message += ` Missing IDs: ${details.missingIds.join(', ')}`;
    }

    super(message);

    this.name = 'CategoriesNotFoundException';
    this.missingIds = details?.missingIds;
  }
}
