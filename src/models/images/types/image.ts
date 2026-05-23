export class Image {
  constructor(
    public id: string | null,
    public fileName: string,
    public originalName: string,
    public mimeType: string,
    public size: number,
    public path: string,
    public entityType: string | null,
    public entityId: string | null,
    public sessionId: string | null,
    public isConfirmed: boolean,
    public createdAt: Date | null,
    public updatedAt: Date | null,
  ) {}

  /** Checks if an object is an Image instance or has Image properties */
  static isValid(obj: unknown): obj is Image {
    return (
      obj !== null &&
      typeof obj === 'object' &&
      'path' in obj &&
      'fileName' in obj &&
      'mimeType' in obj
    );
  }
}
