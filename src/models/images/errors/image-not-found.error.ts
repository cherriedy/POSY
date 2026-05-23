export class ImageNotFoundError extends Error {
  override readonly name = 'ImageNotFoundError';
  constructor(id: string) {
    super(`Image with ID ${id} not found.`);
  }
}
