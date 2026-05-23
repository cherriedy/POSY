export class AccessTokenExpiredError extends Error {
  override readonly name = 'AccessTokenExpiredError';
  constructor() {
    super('The provided access token has expired.');
  }
}
