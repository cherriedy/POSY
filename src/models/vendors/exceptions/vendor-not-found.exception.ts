export class VendorNotFoundException extends Error {
  constructor(id: string) {
    super(`Vendor with ID ${id} not found.`);
    this.name = 'VendorNotFoundException';
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, VendorNotFoundException);
    }
  }
}
