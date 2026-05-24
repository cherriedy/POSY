export class ResetCodeExpiredError extends Error {
  override readonly name = 'ResetCodeExpiredError';
  constructor() {
    super('The reset code has expired.');
  }
}
