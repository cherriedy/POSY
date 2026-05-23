export class InvalidCredentialsError extends Error {
  override readonly name = 'InvalidCredentialsError';
  constructor() {
    super('Invalid email or password. Please check your credentials and try again.');
  }
}
