import {
  CanActivate,
  ExecutionContext,
  Inject,
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { TokenGeneratorsService } from '../../authentication/common/token-generators';
import { AuthenticatedGuestSocket } from '../interfaces';
import { WsException } from '@nestjs/websockets';
import {
  AccessTokenHasExpiredException,
  InvalidAccessTokenException,
} from '../../authentication/exceptions';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';

@Injectable()
export class WsGuestAuthGuard implements CanActivate {
  @Inject(WINSTON_MODULE_NEST_PROVIDER)
  private readonly logger: Logger;

  constructor(
    private readonly tokenGeneratorsService: TokenGeneratorsService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const client = context.switchToWs().getClient<AuthenticatedGuestSocket>();

    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    const token = client.data.cookies?.sessionToken as string;
    if (!token) {
      throw new WsException('Session token is required for authentication');
    }

    try {
      const payload =
        await this.tokenGeneratorsService.verifyTableSessionToken(token);
      client.tableId = payload.tableId;
      client.fingerprint = payload.fingerprint;
      client.type = payload.type;

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
