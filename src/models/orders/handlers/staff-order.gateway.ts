import {
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Inject, Logger } from '@nestjs/common';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';
import { Server } from 'socket.io';
import { AuthenticatedStaffSocket } from '../../../common/interfaces';
import { wsStaffAuthMiddleware } from '../../../common/middleware';
import { TokenGeneratorsService } from '../../../authentication/common/token-generators';

@WebSocketGateway({
  namespace: 'staff/orders',
  cors: {
    origin: '*',
    credentials: true,
  },
})
export class StaffOrderGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  @Inject(WINSTON_MODULE_NEST_PROVIDER)
  private readonly logger: Logger;

  @WebSocketServer()
  server: Server;

  constructor(
    private readonly tokenGeneratorsService: TokenGeneratorsService,
  ) {}

  afterInit(server: Server) {
    // Apply the staff authentication middleware to the WebSocket server
    server.use(wsStaffAuthMiddleware(this.logger, this.tokenGeneratorsService));
  }

  async handleConnection(client: AuthenticatedStaffSocket): Promise<void> {
    const { id: userId, role: userRole } = client.user;
    await client.join('order-room');
    this.logger.debug(
      `User ${userId} (role: ${userRole}) connected to order gateway: ${client.id}, joined order-room`,
    );
  }

  handleDisconnect(client: AuthenticatedStaffSocket) {
    this.logger.warn(
      `Client disconnected from order gateway: ${client.id}, userId: ${client.user.id}`,
    );
  }

  /**
   * Emits an 'order:created' event to all staff in the order room.
   *
   * @event order:created
   * @param orderId - The created order's unique identifier (string)
   * @payload { id: string } - The payload contains the order ID.
   * @example
   *   {
   *     id: 'order-uuid-1234'
   *   }
   */
  emitOrderCreated(orderId: string) {
    this.server.to('order-room').emit('order:created', { id: orderId });
    this.logger.debug(`Emitted order ${orderId} to order room`);
  }

  /**
   * Emits an 'order:updated' event to all staff in the order room.
   *
   * @event order:updated
   * @param orderId - The updated order's unique identifier (string)
   * @payload { id: string } - The payload contains the order ID.
   * @example
   *   {
   *     id: 'order-uuid-1234'
   *   }
   */
  emitOrderUpdated(orderId: string, paymentId?: string) {
    this.server.to('order-room').emit('order:updated', { id: orderId, paymentId: paymentId });
    this.logger.debug(`Emitted order ${orderId} update to order room with payment ${paymentId}`);
  }
}
