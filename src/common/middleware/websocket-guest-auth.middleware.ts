import { TokenGeneratorsService } from '../../authentication/common/token-generators';
import {
  Logger,
  UnauthorizedException,
  InternalServerErrorException,
} from '@nestjs/common';
import { SocketIOMiddleware } from '../types';
import { AuthenticatedGuestSocket } from '../interfaces';
import {
  AccessTokenHasExpiredException,
  InvalidAccessTokenException,
} from '../../authentication/exceptions';
import {
  TableSessionConfig,
  TableSessionPayload,
} from '../../models/table-sessions';

/**
 * Middleware for authenticating guest users connecting via WebSocket. It extracts the session token
 * from the cookies in the handshake headers, verifies it, and attaches the user information to the
 * socket object for use in subsequent handlers.
 *
 * @param logger {Logger} - The logger instance for logging authentication attempts and errors.
 * @param config {TableSessionConfig} - The configuration object containing settings for table sessions.
 * @param service {TokenGeneratorsService} - The service used to verify the session token and extract the payload.
 * @return {SocketIOMiddleware} - The middleware function to be used in the WebSocket gateway.
 *
 * @remarks This middleware should be applied to WebSocket gateways that extends the {@link CookieParserGateway} to ensure
 * that the cookies are parsed and available in the socket's data property.
 */
export const wsGuestAuthMiddleware = (
  logger: Logger,
  config: TableSessionConfig,
  service: TokenGeneratorsService,
): SocketIOMiddleware => {
  // eslint-disable-next-line @typescript-eslint/no-misused-promises
  return async (client: AuthenticatedGuestSocket, next) => {
    try {
      // const rawCookie = client.handshake.headers.cookie;
      // if (!rawCookie) {
      //   logger.warn(
      //     `Unauthorized connection attempt from client ${client.id}: No cookies provided`,
      //   );
      //   return next(new Error('Session token is required for authentication'));
      // }
      //
      // // Parse the raw cookie string to extract the session token
      // const token = cookie.parse(rawCookie)[config.cookie.name];

      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      const token = client.data.cookies[config.cookie.name] as string;

      if (!token) {
        logger.warn(
          `Unauthorized connection attempt from client ${client.id}: Session token cookie "${config.cookie.name}" not found`,
        );
        return next(new Error('Session token is required for authentication'));
      }

      const payload = await verifyToken(service, logger, token);
      client.tableId = payload.tableId;
      client.fingerprint = payload.fingerprint;
      client.type = payload.type;

      next();
    } catch (e) {
      if (e instanceof UnauthorizedException) {
        logger.warn(
          `Unauthorized connection attempt from client ${client.id}: ${e.message}`,
        );
        return next(new Error(e.message));
      } else if (e instanceof InternalServerErrorException) {
        logger.error(
          `Error during connection for client ${client.id}: ${e.message}`,
        );
        return next(new Error('Internal server error during authentication'));
      }
      logger.error(e);
      return next(new Error('Unexpected error during authentication'));
    }
  };
};

async function verifyToken(
  service: TokenGeneratorsService,
  logger: Logger,
  token: string,
): Promise<TableSessionPayload> {
  try {
    return await service.verifyTableSessionToken(token);
  } catch (e) {
    if (
      e instanceof InvalidAccessTokenException ||
      e instanceof AccessTokenHasExpiredException
    ) {
      throw new UnauthorizedException(e.message);
    }
    logger.error(e);
    throw new InternalServerErrorException(
      'There was an error verifying token',
    );
  }
}
