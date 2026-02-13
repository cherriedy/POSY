export class TableNotFoundException extends Error {
  constructor(id: string) {
    super(`Table with ID ${id} not found.`);
    this.name = 'TableNotFoundException';
  }
}
