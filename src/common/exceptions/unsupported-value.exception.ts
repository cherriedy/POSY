export class UnsupportedValueException extends Error {
  public readonly value: unknown;

  constructor(value: unknown, message = 'Unsupported value provided.') {
    const serialized = UnsupportedValueException.serialize(value);
    super(`${message} Received: ${serialized}`);

    this.value = value;
    this.name = 'UnsupportedValueError';

    // Maintains proper stack trace for where our error was thrown
    // (only available on V8 engines)
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, UnsupportedValueException);
    }
  }

  private static serialize(value: unknown): string {
    try {
      return JSON.stringify(value);
    } catch {
      return '[Unserializable value]';
    }
  }
}
