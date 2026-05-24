export class InvalidAccessTokenError extends Error {
  override readonly name = 'InvalidAccessTokenError';
  constructor() {
    super('The provided access token is invalid.');
  }
}
