import { TableSession } from '../types';
import { BaseRepository } from '../../../common/interfaces';

export abstract class TableSessionRepository implements BaseRepository<TableSession> {
  /**
   * Creates a new table session in the repository.
   * @param entity - The table session entity to create.
   * @returns A promise that resolves to the created table session.
   */
  abstract create(entity: TableSession): Promise<TableSession>;

  /**
   * Finds a table session by its unique identifier.
   * @param id - The unique identifier of the table session to find.
   * @returns A promise that resolves to the found table session or null if not found.
   */
  abstract findById(id: string): Promise<TableSession | null>;

  /**
   * Deletes a table session by its unique identifier.
   * @param id - The unique identifier of the table session to delete.
   * @returns A promise that resolves when the table session is deleted.
   */
  abstract delete(id: string): Promise<void>;

  /**
   * Updates an existing table session by its unique identifier.
   * @param id - The unique identifier of the table session to update.
   * @param entity - Partial data to update the table session with.
   * @returns A promise that resolves to the updated table session.
   */
  abstract update(
    id: string,
    entity: Partial<TableSession>,
  ): Promise<TableSession>;

  /**
   * Finds the active session for a specific table.
   * @param tableId - The unique identifier of the table.
   * @returns A promise that resolves to the active table session or null if not found.
   */
  abstract findActiveByTableId(tableId: string): Promise<TableSession | null>;

  /**
   * Finds a table session by its session token.
   * @param sessionToken - The session token to search for.
   * @returns A promise that resolves to the found table session or null if not found.
   */
  abstract findByToken(sessionToken: string): Promise<TableSession | null>;

  /**
   * Ends a table session by marking it as completed.
   * @param sessionId - The unique identifier of the session to end.
   * @returns A promise that resolves to the updated table session.
   */
  abstract endSession(sessionId: string): Promise<TableSession>;

  /**
   * Invalidates all expired sessions by marking them as cancelled.
   * @returns A promise that resolves to the number of sessions invalidated.
   */
  abstract invalidateExpiredSessions(): Promise<number>;
}
