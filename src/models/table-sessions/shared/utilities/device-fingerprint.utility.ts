import { createHash } from 'crypto';

export class DeviceFingerprintUtility {
  /**
   * Generates a device fingerprint hash based on the provided user agent and IP address.
   * The fingerprint is created by concatenating the user agent and IP address with a pipe (|),
   * then hashing the result using SHA-256.
   *
   * @param {string} userAgent - The user agent string from the client (e.g., browser or device info).
   * @param {string} ipAddress - The IP address of the client.
   * @returns {string} The SHA-256 hash representing the device fingerprint in hexadecimal format.
   */
  static generate(userAgent: string, ipAddress: string): string {
    const fp = `${userAgent}|${ipAddress}`;
    return createHash('sha256').update(fp).digest('hex');
  }

  /**
   * Validates whether the provided fingerprint matches the one generated from the given user agent and IP address.
   *
   * @param {string} userAgent - The user agent string from the client.
   * @param {string} ipAddress - The IP address of the client.
   * @param {string} caclFp - The fingerprint to validate against (expected SHA-256 hash).
   * @returns {boolean} True if the generated fingerprint matches the provided one, false otherwise.
   */
  static validate(
    userAgent: string,
    ipAddress: string,
    caclFp: string,
  ): boolean {
    const refFp = this.generate(userAgent, ipAddress);
    return refFp === caclFp;
  }
}
