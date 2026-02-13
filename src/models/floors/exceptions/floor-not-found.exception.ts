export class FloorNotFoundException extends Error {
  constructor(id: string) {
    super(`Floor with ID ${id} not found.`);
    this.name = 'FloorNotFoundException';
  }
}
