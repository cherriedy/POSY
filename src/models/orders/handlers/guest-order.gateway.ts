import {
  OnGatewayConnection,
  OnGatewayDisconnect,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { CookieParserGateway } from '../../../common/handlers';
import { Server } from 'socket.io';
import { wsGuestAuthMiddleware } from '../../../common/middleware';
import { Inject, Logger } from '@nestjs/common';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';
import { TokenGeneratorsService } from 'src/authentication/common/token-generators';
import { TableSessionConfig } from '../../table-sessions';
import { AuthenticatedGuestSocket } from '../../../common/interfaces';

@WebSocketGateway({
  namespace: 'guest/orders',
  cors: {
    origin: '*',
    credentials: true,
  },
})
export class GuestOrderGateway
  extends CookieParserGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  @Inject(WINSTON_MODULE_NEST_PROVIDER)
  private readonly logger: Logger;

  @WebSocketServer()
  server: Server;

  constructor(
    private readonly config: TableSessionConfig,
    private readonly service: TokenGeneratorsService,
  ) {
    super();
  }

  afterInit(server: Server) {
    super.afterInit(server);
    // Apply the guest authentication middleware to the WebSocket server
    server.use(wsGuestAuthMiddleware(this.logger, this.config, this.service));
  }

  async handleConnection(client: AuthenticatedGuestSocket): Promise<void> {
    const { id, tableId } = client;
    await client.join(`table-room:${tableId}`);
    this.logger.debug(
      `Guest connected to order gateway: ${id}, joined table-room:${tableId}`,
    );
  }

  handleDisconnect(client: AuthenticatedGuestSocket) {
    const { id, tableId } = client;
    this.logger.warn(
      `Guest disconnected from order gateway: ${id}, tableId: ${tableId}`,
    );
  }

  /**
   * Emits an 'order:created' event to all guests in the table room.
   *
   * @event order:created
   * @param tableId - The table's unique identifier (string)
   * @param orderId - The newly created order's unique identifier (string)
   * @payload { id: string } - The payload contains the order ID.
   * @example
   *   {
   *     id: 'order-uuid-1234'
   *   }
   */
  emitOrderCreated(tableId: string, orderId: string) {
    this.server
      .to(`table-room:${tableId}`)
      .emit('order:created', { id: orderId });
    this.logger.debug(
      `Emitted order create ${orderId} to table-room:${tableId}`,
    );
  }

  /**
   * Emits an 'order:updated' event to all guests in the table room.
   *
   * @event order:updated
   * @param tableId - The table's unique identifier (string)
   * @param orderId - The updated order's unique identifier (string)
   * @payload { id: string } - The payload contains the order ID.
   * @example
   *   {
   *     id: 'order-uuid-1234'
   *   }
   */
  emitOrderUpdated(tableId: string, orderId: string) {
    this.server
      .to(`table-room:${tableId}`)
      .emit('order:updated', { id: orderId });
    this.logger.debug(
      `Emitted order update for ${orderId} to table-room:${tableId}`,
    );
  }
}
