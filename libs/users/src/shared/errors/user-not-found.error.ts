export class UserNotFoundError extends Error {
  override readonly name = 'UserNotFoundError';

  constructor(details?: { email?: string; id?: string }) {
    const placeholder = details && (details.id || details.email) ? 'with ' : '';
    let message = `User ${placeholder}`;
    if (details?.email) message += `Email: ${details.email}`;
    if (details?.id) message += `ID: ${details.id}`;
    message += ' not found.';
    super(message);
  }
}
