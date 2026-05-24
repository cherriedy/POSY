export class UnitNotFoundException extends Error {
  constructor(id: string) {
    super(`Unit with ID ${id} not found.`);
    this.name = 'UnitNotFoundException';
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, UnitNotFoundException);
    }
  }
}
