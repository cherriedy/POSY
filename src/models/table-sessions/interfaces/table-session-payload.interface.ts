/**
 * Represents the payload for a table session, typically used for authentication or session management.
 *
 * @property {string} tableId - The unique identifier of the table associated with the session.
 * @property {string | null} userId - The unique identifier of the user associated with the session, or null if not assigned.
 * @property {string} fingerprint - The device or browser fingerprint used to uniquely identify the session source.
 * @property {'table_session'} type - The type of the payload, always set to 'table_session' for table session identification.
 */
export interface TableSessionPayload {
  tableId: string;
  userId: string | null;
  fingerprint: string;
  type: 'table_session';
}
