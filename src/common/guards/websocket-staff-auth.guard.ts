import {
  CanActivate,
  ExecutionContext,
  Inject,
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { TokenGeneratorsService } from '../../authentication/common/token-generators';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';
import { WsException } from '@nestjs/websockets';
import { JwtPayload } from '../../authentication/interfaces';
import { AuthenticatedStaffSocket } from '../interfaces';
import {
  AccessTokenHasExpiredException,
  InvalidAccessTokenException,
} from '../../authentication/exceptions';

/**
 * @description A WebSocket guard that verifies the presence and validity of an access token for staff members.
 * This guard is used to protect WebSocket gateways that require staff authentication. It checks for the token in both
 * the `auth` and `query` sections of the WebSocket handshake, verifies it using the `TokenGeneratorsService`, and attaches
 * the authenticated user's information to the socket for use in subsequent handlers.
 *
 * @class WsStaffAuthGuard
 * @implements {CanActivate}
 *
 */
@Injectable()
export class WsStaffAuthGuard implements CanActivate {
  @Inject(WINSTON_MODULE_NEST_PROVIDER)
  private readonly logger: Logger;

  constructor(
    private readonly tokenGeneratorsService: TokenGeneratorsService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const client = context.switchToWs().getClient<AuthenticatedStaffSocket>();

    // Attempt to extract token from both auth and query
    const token = (client.handshake.auth?.token ||
      client.handshake.query?.token) as string;
    if (!token) {
      this.logger.warn(
        `WebSocket client ${client.id} attempted connection without token`,
      );
      throw new WsException('Access token is required');
    }

    try {
      const payload =
        await this.tokenGeneratorsService.verifyAccessToken<JwtPayload>(token);
      client.user = { id: payload.sub, role: payload.role };

      return true;
    } catch (e) {
      if (
        e instanceof InvalidAccessTokenException ||
        e instanceof AccessTokenHasExpiredException
      ) {
        this.logger.warn(
          `Unauthorized WebSocket connection attempt from client ${client.id}: ${e.message}`,
        );
        throw new WsException(e.message);
      } else if (e instanceof InternalServerErrorException) {
        this.logger.error(
          `Internal error during connection for client ${client.id}`,
          e.stack,
        );
        throw new WsException('Internal server error during authentication');
      }
      this.logger.error(e, e instanceof Error ? e.stack : null);
      throw new WsException('Unexpected error during authentication');
    }
  }
}
