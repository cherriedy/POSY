export class RefreshTokenExpiredError extends Error {
  override readonly name = 'RefreshTokenExpiredError';
  constructor() {
    super('The refresh token has expired.');
  }
}
