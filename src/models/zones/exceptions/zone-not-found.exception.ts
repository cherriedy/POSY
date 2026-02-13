export class ZoneNotFoundException extends Error {
  constructor(id: string) {
    super(`Zone with ID ${id} not found.`);
    this.name = 'ZoneNotFoundException';
  }
}
