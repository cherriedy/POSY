import { Socket } from 'socket.io';
import { TableSessionPayload } from '../../models/table-sessions/shared/interfaces/table-session-payload.interface';

/**
 * @description An websocket interface including authenticated guest information.
 * This is used in the WebSocket gateway to type the client socket after authentication.
 *
 * @interface AuthenticatedGuestSocket
 * @extends TableSessionPayload
 * @extends Socket
 */
export interface AuthenticatedGuestSocket
  extends Socket, Omit<TableSessionPayload, 'userId'> {}
