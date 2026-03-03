/**
 * Interface representing the configuration options for JWT.
 *
 * @property {string} secret - The secret key used to sign and verify JWT tokens.
 * @property {number} expiresIn - The duration (in seconds) for which the JWT token is valid.
 */
export interface JwtConfig {
  secret: string;
  expiresIn: number;
}
