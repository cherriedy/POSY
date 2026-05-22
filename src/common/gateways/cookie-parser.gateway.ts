import { OnGatewayInit } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import * as cookie from 'cookie';

/**
 * @description A WebSocket gateway that parses cookies from incoming socket connections and attaches them to the socket's data property.
 * This gateway is intended to be used as a global middleware for WebSocket connections, allowing subsequent handlers and guards to access
 * cookie data for authentication and session management purposes.
 *
 * @class CookieParserGateway
 * @implements {OnGatewayInit}
 *
 * @example
 * ```TypeScript
 * @WebSocketGateway({
 *   namespace: '/orders',
 *   cors: {
 *     origin: '*',
 *     credentials: true,
 *   },
 * })
 * export class StaffOrderGateway extends CookieParserGateway implements OnGatewayConnection, OnGatewayDisconnect {
 *   // ... other gateway methods and properties
 * }
 * ```
 */
export class CookieParserGateway implements OnGatewayInit {
  afterInit(server: Server) {
    server.use((socket: Socket, next) => {
      const rawCookie = socket.handshake.headers.cookie || '';
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      socket.data.cookies = cookie.parse(rawCookie);
      next();
    });
  }
}
