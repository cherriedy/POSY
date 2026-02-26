import { NotFoundException } from '@nestjs/common';

export class CategoryNotFoundException extends NotFoundException {
  constructor(id: string) {
    super(`Category with ID ${id} not found.`);
    this.name = 'CategoryNotFoundException';
  }
}

export class CategoriesNotFoundException extends NotFoundException {
  constructor() {
    super('One or more categories not found or deleted.');
  }
}