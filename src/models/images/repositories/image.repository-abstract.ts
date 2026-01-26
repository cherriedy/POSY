import { Image } from '../types';
import { BaseRepository } from '../../../common/interfaces';

export abstract class ImageRepository implements BaseRepository<Image> {
  /**
   * Creates a new image in the repository.
   * @param entity - The image entity to create.
   * @returns A promise that resolves to the created image.
   */
  abstract create(entity: Image): Promise<Image>;

  /**
   * Finds an image by its unique identifier.
   * @param id - The unique identifier of the image to find.
   * @returns A promise that resolves to the found image or null if not found.
   */
  abstract findById(id: string): Promise<Image | null>;

  /**
   * Deletes an image by its unique identifier.
   * @param id - The unique identifier of the image to delete.
   * @returns A promise that resolves when the image is deleted.
   */
  abstract delete(id: string): Promise<void>;

  /**
   * Finds all images by session ID.
   * @param sessionId - The session ID to filter images.
   * @returns A promise that resolves to an array of images.
   */
  abstract findBySessionId(sessionId: string): Promise<Image[]>;

  /**
   * Finds all images by entity type and entity ID.
   * @param entityType - The entity type (e.g., 'USER', 'PRODUCT').
   * @param entityId - The entity ID.
   * @returns A promise that resolves to an array of confirmed images.
   */
  abstract findByEntity(entityType: string, entityId: string): Promise<Image[]>;

  /**
   * Confirms all images in a session by updating their confirmation status.
   * @param sessionId - The session ID to confirm.
   * @param entityType - Optional entity type to associate with the images.
   * @param entityId - Optional entity ID to associate with the images.
   * @returns A promise that resolves to the number of images updated.
   */
  abstract confirmSession(
    sessionId: string,
    entityType?: string,
    entityId?: string,
  ): Promise<number>;

  /**
   * Cancels a session by deleting all unconfirmed images.
   * @param sessionId - The session ID to cancel.
   * @returns A promise that resolves to the number of images deleted.
   */
  abstract cancelSession(sessionId: string): Promise<number>;

  /**
   * Finds orphaned images that are unconfirmed and older than the specified date.
   * @param olderThan - The date threshold for finding orphaned images.
   * @returns A promise that resolves to an array of orphaned images.
   */
  abstract findOrphanedImages(olderThan: Date): Promise<Image[]>;

  /**
   * Deletes multiple images by their IDs.
   * @param ids - The array of image IDs to delete.
   * @returns A promise that resolves to the number of images deleted.
   */
  abstract deleteMany(ids: string[]): Promise<number>;
}
