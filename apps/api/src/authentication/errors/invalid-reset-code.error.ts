export class InvalidResetCodeError extends Error {
  override readonly name = 'InvalidResetCodeError';
  constructor() {
    super('The provided reset code is invalid');
  }
}
