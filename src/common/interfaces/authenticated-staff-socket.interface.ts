import { Socket } from 'socket.io';

/**
 * @description An websocket interface including authenticated staff member information.
 * This is used in the WebSocket gateway to type the client socket after authentication.
 *
 * @interface AuthenticatedStaffSocket
 * @extends Socket
 * @property {Object} user - The authenticated user's information extracted from the token.
 * @property {string} user.id - The unique identifier of the authenticated staff member.
 * @property {string} user.role - The role of the authenticated staff member (e.g., 'staff').
 * @property {any} [filter] - Optional property to store any filters or additional data related to the socket connection.
 *
 */
export interface AuthenticatedStaffSocket extends Socket {
  user: {
    id: string;
    role: string;
  };
  filter?: any;
}
