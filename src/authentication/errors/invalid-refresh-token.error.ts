export class InvalidRefreshTokenError extends Error {
  override readonly name = 'InvalidRefreshTokenError';
  constructor() {
    super('The provided refresh token is invalid or has expired.');
  }
}
