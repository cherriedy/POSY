export class TableSessionNotFoundException extends Error {
  constructor() {
    super('Table session not found');
    this.name = 'TableSessionNotFoundException';
  }
}
