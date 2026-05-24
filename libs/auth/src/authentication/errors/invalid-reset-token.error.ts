export class InvalidResetTokenError extends Error {
  override readonly name = 'InvalidResetTokenError';
  constructor() {
    super('The provided reset token is invalid or has expired.');
  }
}
