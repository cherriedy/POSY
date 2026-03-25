import {
  InternalServerErrorException,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtPayload } from '../../authentication/interfaces';
import { TokenGeneratorsService } from '../../authentication/common/token-generators';
import {
  AccessTokenHasExpiredException,
  InvalidAccessTokenException,
} from '../../authentication/exceptions';
import { SocketIOMiddleware } from '../types';
import { AuthenticatedStaffSocket } from '../interfaces';

/**
 * Middleware for authenticating staff members connecting via WebSocket. It checks for the presence of an access token
 * in the handshake's `auth` or `query` parameters, verifies it using the `TokenGeneratorsService`, and attaches the
 * authenticated user's information to the socket object for use in subsequent handlers.
 *
 * @param logger {Logger} - The logger instance for logging authentication attempts and errors.
 * @param service {TokenGeneratorsService} - The service used to verify the access token and extract the payload.
 * @return {SocketIOMiddleware} - The middleware function to be used in the WebSocket gateway.
 */
export const wsStaffAuthMiddleware = (
  logger: Logger,
  service: TokenGeneratorsService,
): SocketIOMiddleware => {
  // eslint-disable-next-line @typescript-eslint/no-misused-promises
  return async (client: AuthenticatedStaffSocket, next) => {
    try {
      const token = (client.handshake.auth?.token ||
        client.handshake.query?.token) as string;
      if (!token) {
        logger.warn(`Client ${client.id} attempted connection without token`);
        return next(new Error('Access token is required'));
      }

      const { userId, role } = await verifyToken(service, logger, token);
      client.user = { id: userId, role };

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
      } else {
        logger.error(e);
        return next(new Error('Unexpected error during authentication'));
      }
    }
  };
};

async function verifyToken(
  tokenGeneratorsService: TokenGeneratorsService,
  logger: Logger,
  token: string,
): Promise<{ userId: string; role: string }> {
  try {
    const payload =
      await tokenGeneratorsService.verifyAccessToken<JwtPayload>(token);

    return { userId: payload.sub, role: payload.role };
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
