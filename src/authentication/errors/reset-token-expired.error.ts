export class ResetTokenExpiredError extends Error {
  override readonly name = 'ResetTokenExpiredError';
  constructor() {
    super('The reset token has expired.');
  }
}
