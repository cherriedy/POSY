import { Socket } from 'socket.io';

/**
 * @description A type definition for Socket.IO middleware functions. This function is executed for each incoming
 * socket connection and can be used to perform tasks such as authentication, logging, or modifying the socket
 * object before it is handled by the gateway.
 *
 * @typedef SocketIOMiddleware
 * @param {Socket} socket - The Socket.IO socket object representing the client's connection.
 * @param {Function} next - A callback function that must be called to pass control to the next middleware function.
 */
export type SocketIOMiddleware = (
  socket: Socket,
  next: (err?: any) => void,
) => void;
