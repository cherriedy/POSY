import { Socket } from 'socket.io';
import { TableSessionPayload } from './table-session-payload.interface';

export interface AuthenticatedGuestSocket
  extends Socket, Omit<TableSessionPayload, 'userId'> {}
