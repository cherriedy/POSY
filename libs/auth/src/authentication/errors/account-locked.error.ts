export class AccountLockedError extends Error {
  override readonly name = 'AccountLockedError';
  constructor(message: string) {
    super(message);
  }
}
