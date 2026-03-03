export class OrderNotFoundException extends Error {
  constructor(id: string) {
    super(`Order with ID "${id}" was not found`);
    this.name = 'OrderNotFoundException';
  }
}
