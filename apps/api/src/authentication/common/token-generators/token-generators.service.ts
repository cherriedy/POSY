import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { JwtConfigService } from '@posy/shared';
import { authConfig } from '../../auth.config';
import { JsonWebTokenError, TokenExpiredError } from 'jsonwebtoken';
import { AccessTokenExpiredError } from '../../errors/access-token-expired.error';
import { InvalidAccessTokenError } from '../../errors/invalid-access-token.error';
import { InvalidRefreshTokenError } from '../../errors/invalid-refresh-token.error';
import { RefreshTokenExpiredError } from '../../errors/refresh-token-expired.error';
import { TableSessionConfig } from '../../../models/table-sessions/table-session.config';
import { TableSessionPayload } from '../../../models/table-sessions/shared/interfaces/table-session-payload.interface';
import { TableSessionRepository } from '../../../models/table-sessions/shared/repositories/table-session-repository.abstract';

@Injectable()
export class TokenGeneratorsService {
  private readonly accessTokenSecure: string;
  private readonly accessTokenExpiresIn: string;
  private readonly refreshTokenSecure: string;
  private readonly refreshTokenExpiresIn: string;
  private readonly tableSessionTokenSecure: string;
  private readonly tableSessionTokenExpiresIn: string;

  constructor(
    private readonly jwtService: JwtService,
    private readonly jwtConfigService: JwtConfigService,
    private readonly tableSessionRepository: TableSessionRepository,
    private readonly tableSessionConfig: TableSessionConfig,
  ) {
    this.accessTokenSecure = this.jwtConfigService.secret;
    this.accessTokenExpiresIn = `${authConfig.signIn.accessToken.expire}h`;
    this.refreshTokenSecure = this.jwtConfigService.refreshSecret;
    this.refreshTokenExpiresIn = `${authConfig.signIn.refreshToken.expire}d`;
    this.tableSessionTokenSecure = this.tableSessionConfig.jwt.secret;
    this.tableSessionTokenExpiresIn = `${this.tableSessionConfig.jwt.expiresIn}s`;
  }

  /**
   * Generates a signed JWT access token for the provided payload.
   *
   * Uses the configured access token secret and expiration time to sign the payload.
   * The payload typically contains user identification and claims required for authentication.
   *
   * @param {object} payload - The payload to encode in the JWT access token. Should include user-specific claims.
   * @returns {Promise<string>} A promise that resolves to the signed JWT access token as a string.
   * @throws {Error} If signing the token fails due to misconfiguration or internal errors.
   */
  async generateAccessToken(payload: object): Promise<string> {
    // @ts-expect-error: jwtService.signAsync may have type mismatch due to custom payload typing
    return await this.jwtService.signAsync(payload, {
      secret: this.accessTokenSecure,
      expiresIn: this.accessTokenExpiresIn,
    });
  }

  /**
   * Generates a signed JWT refresh token for the provided payload.
   *
   * Uses the configured refresh token secret and expiration time to sign the payload.
   * The payload should contain enough information to identify the user and validate the refresh process.
   *
   * @param {object} payload - The payload to encode in the JWT refresh token. Should include user-specific claims.
   * @returns {Promise<string>} A promise that resolves to the signed JWT refresh token as a string.
   * @throws {Error} If signing the token fails due to misconfiguration or internal errors.
   */
  async generateRefreshToken(payload: object): Promise<string> {
    // @ts-expect-error: jwtService.signAsync may have type mismatch due to custom payload typing
    return await this.jwtService.signAsync(payload, {
      secret: this.refreshTokenSecure,
      expiresIn: this.refreshTokenExpiresIn,
    });
  }

  /**
   * Verifies and decodes a JWT refresh token, handling all error scenarios and mapping them to custom exceptions.
   *
   * This method checks the validity and integrity of the provided JWT refresh token using the configured refresh token secret.
   * If the token is valid and not expired, it returns the decoded payload (claims). If the token is invalid, expired, or has been tampered with,
   * it throws a custom exception: InvalidRefreshTokenError for invalid tokens, and RefreshTokenExpiredError for expired tokens.
   * This is typically used to issue new access tokens during the refresh flow.
   *
   * @template T - The expected shape of the decoded payload (defaults to any object).
   * @param {string} token - The JWT refresh token to verify and decode.
   * @returns {Promise<T>} The decoded payload of the refresh token if verification is successful.
   * @throws {InvalidRefreshTokenError} If the token is invalid, malformed, or has been tampered with.
   * @throws {RefreshTokenExpiredError} If the token is expired.
   * @throws {Error} For unexpected internal errors during token verification.
   */
  async verifyRefreshToken<T extends object = any>(token: string): Promise<T> {
    try {
      return await this.jwtService.verifyAsync(token, {
        secret: this.refreshTokenSecure,
      });
    } catch (e) {
      if (e instanceof JsonWebTokenError) {
        throw new InvalidRefreshTokenError();
      } else if (e instanceof TokenExpiredError) {
        throw new RefreshTokenExpiredError();
      }
      throw e;
    }
  }

  /**
   * Verifies and decodes a JWT access token, handling all error scenarios and mapping them to custom exceptions.
   *
   * This method checks the validity and integrity of the provided JWT access token using the configured access token secret.
   * If the token is valid and not expired, it returns the decoded payload (claims). If the token is invalid, expired, or has been tampered with,
   * it throws a custom exception: InvalidAccessTokenError for invalid tokens, and AccessTokenExpiredError for expired tokens.
   * This is typically used to authenticate requests and authorize access to protected resources.
   *
   * @template T - The expected shape of the decoded payload (defaults to any object).
   * @param {string} token - The JWT access token to verify and decode.
   * @returns {Promise<T>} The decoded payload of the access token if verification is successful.
   * @throws {InvalidAccessTokenError} If the token is invalid, malformed, or has been tampered with.
   * @throws {AccessTokenExpiredError} If the token is expired.
   * @throws {Error} For unexpected internal errors during token verification.
   */
  async verifyAccessToken<T extends object = any>(token: string): Promise<T> {
    try {
      return await this.jwtService.verifyAsync(token, {
        secret: this.accessTokenSecure,
      });
    } catch (e) {
      if (e instanceof JsonWebTokenError) {
        throw new InvalidAccessTokenError();
      } else if (e instanceof TokenExpiredError) {
        throw new AccessTokenExpiredError();
      }
      throw e;
    }
  }

  /**
   * Verifies and decodes a JWT table session token, handling all error scenarios and mapping them to custom exceptions.
   *
   * This method checks the validity and integrity of the provided JWT table session token using the configured table session token secret.
   * If the token is valid and not expired, it returns the decoded payload (claims). If the token is invalid, expired, or has been tampered with,
   * it throws a custom exception: InvalidAccessTokenError for invalid tokens, and AccessTokenExpiredError for expired tokens.
   * This is typically used to authenticate table sessions and authorize access to table-specific resources.
   *
   * @param {string} token - The JWT table session token to verify and decode.
   * @return {Promise<TableSessionPayload>} The decoded payload of the table session token if verification is successful.
   * @throws {InvalidAccessTokenError} If the token is invalid, malformed, or has been tampered with.
   * @throws {AccessTokenExpiredError} If the token is expired.
   * @throws {Error} For unexpected internal errors during token verification.
   */
  async verifyTableSessionToken(token: string): Promise<TableSessionPayload> {
    try {
      return await this.jwtService.verifyAsync(token, {
        secret: this.tableSessionTokenSecure,
      });
    } catch (e) {
      if (e instanceof JsonWebTokenError) {
        throw new InvalidAccessTokenError();
      } else if (e instanceof TokenExpiredError) {
        throw new AccessTokenExpiredError();
      }
      throw e;
    }
  }
}
