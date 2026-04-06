import { BaseRepository } from '../../../../common/interfaces';
import { SessionPreference } from '../entities';

export abstract class SessionPreferenceRepository implements BaseRepository<SessionPreference> {
  /**
   * Creates a new session preference record in the data store.
   *
   * @param entity - The session preference entity to create.
   * @returns A promise that resolves to the newly created session preference.
   */
  abstract create(entity: SessionPreference): Promise<SessionPreference>;

  /**
   * Finds a session preference by its unique identifier.
   *
   * @param id - The unique ID of the session preference to find.
   * @returns A promise that resolves to the found session preference or `null` if not found.
   */
  abstract findById(id: string): Promise<SessionPreference | null>;

  /**
   * Deletes a session preference by its unique identifier.
   *
   * @param id - The unique ID of the session preference to delete.
   * @returns A promise that resolves when the deletion is complete.
   */
  abstract delete(id: string): Promise<void>;

  /**
   * Updates an existing session preference by its unique identifier.
   *
   * @param id - The unique ID of the session preference to update.
   * @param entity - A partial entity containing the fields to update.
   * @returns A promise that resolves to the updated session preference.
   */
  abstract update(
    id: string,
    entity: Partial<SessionPreference>,
  ): Promise<SessionPreference>;

  /**
   * Finds a session preference by its associated session ID.
   *
   * @param sessionId - The unique ID of the session.
   * @returns A promise that resolves to the found session preference or `null` if not found.
   */
  abstract findBySessionId(
    sessionId: string,
  ): Promise<SessionPreference | null>;

  /**
   * Updates an existing session preference by its associated session ID.
   *
   * @param sessionId - The unique ID of the session whose preference is to be updated.
   * @param entity - A partial entity containing the fields to update.
   * @returns A promise that resolves to the updated session preference.
   */
  abstract updateBySessionId(
    sessionId: string,
    entity: Partial<SessionPreference>,
  ): Promise<SessionPreference>;
}
