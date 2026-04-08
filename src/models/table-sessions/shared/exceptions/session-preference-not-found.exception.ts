export class SessionPreferenceNotFoundException extends Error {
  constructor(message: string = 'Session preference not found') {
    super(message);
    this.name = 'SessionPreferenceNotFoundException';

    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, SessionPreferenceNotFoundException);
    }
  }
}
