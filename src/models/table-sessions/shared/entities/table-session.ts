import { TableSessionStatus, TableSessionType } from '../enums';
import { Table } from '../../../tables/types';
import { User } from '../../../users/types/user.class';

/**
 * @description
 * Represents a session for a table, which can be initiated by either a guest or a staff member.
 * The session tracks the status, type, and relevant timestamps, as well as associations to the
 * table and user (if applicable).
 *
 * @class TableSession
 * @property {string | null} id - The ID of the table session
 * @property {string} tableId - The ID of the associated table
 * @property {string | null} userId - The ID of the staff member initiating the session
 * @property {string | null} sessionToken - The JWT token for guest sessions
 * @property {string | null} deviceFingerprint - The device fingerprint for guest
 * @property {TableSessionStatus} status - The current status of the table session
 * @property {TableSessionType} sessionType - The type of the table session
 * @property {Date | null} startAt - The timestamp when the session started
 * @property {Date | null} endAt - The timestamp when the session ended
 * @property {Date | null} expiresAt - The timestamp when the session expires
 * @property {Table | null} table - The associated table entity (optional)
 * @property {User | null} user - The associated user entity for staff-initiated sessions (optional)
 * @remarks
 * - For guest-initiated sessions, `userId` will be null, and `sessionToken` and `deviceFingerprint` will be populated.
 * - For staff-initiated sessions, `userId` will contain the staff member's ID, while `sessionToken` and `deviceFingerprint` will be null.
 */
export class TableSession {
  constructor(
    public id: string | null,
    public tableId: string,
    public userId: string | null,
    public sessionToken: string | null,
    public deviceFingerprint: string | null,
    public status: TableSessionStatus,
    public sessionType: TableSessionType,
    public startAt: Date = new Date(),
    public endAt: Date | null,
    public expiresAt: Date | null,
    // Relations
    public table: Table | null,
    public user: User | null,
  ) {}
}
