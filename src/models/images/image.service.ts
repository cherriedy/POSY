import { Inject, Injectable } from '@nestjs/common';
import { ImageRepository } from './repositories';
import { Image, ImageMapper } from './types';
import { ImageNotFoundException } from './exceptions';
import * as fs from 'fs/promises';
import { Cron, CronExpression } from '@nestjs/schedule';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';
import { imageConfig } from './image.config';

@Injectable()
export class ImageService {
  @Inject(WINSTON_MODULE_NEST_PROVIDER)
  private readonly logger: import('winston').Logger;
  private readonly tempImageExpiryTime: number;

  constructor(private readonly imageRepository: ImageRepository) {
    // Calculate temp image expiry time in milliseconds
    const { tempImageExpiryTime } = imageConfig;
    const parsed = parseInt(tempImageExpiryTime.slice(0, -1), 10);
    if (tempImageExpiryTime.endsWith('m')) {
      this.tempImageExpiryTime = parsed * 60 * 1000;
    } else if (tempImageExpiryTime.endsWith('h')) {
      this.tempImageExpiryTime = parsed * 60 * 60 * 1000;
    } else if (tempImageExpiryTime.endsWith('d')) {
      this.tempImageExpiryTime = parsed * 24 * 60 * 60 * 1000;
    } else {
      this.tempImageExpiryTime = parsed;
    }
  }

  /**
   * Uploads an image file, associates it with a session, and optionally with an entity.
   * The image is stored in the file system and its metadata is saved in the repository.
   *
   * @param file - The uploaded image file (from Multer).
   * @param sessionId - The session identifier to group temporary images.
   * @param entityType - (Optional) The type of entity the image may be associated with (e.g., 'product').
   * @param entityId - (Optional) The ID of the entity the image may be associated with.
   * @returns The created Image domain object.
   */
  async uploadImages(
    files: Express.Multer.File[],
    sessionId: string,
    entityType?: string,
    entityId?: string,
  ): Promise<Image[]> {
    return Promise.all(
      files.map(file =>
        this.imageRepository.create(
          ImageMapper.fileToDomain(file, sessionId, entityType, entityId),
        ),
      ),
    );
  }

  /**
   * Confirms all images associated with a session, marking them as permanent and optionally associating them with an entity.
   * Should be called when the user completes the process (e.g., saves a product).
   *
   * @param sessionId - The session identifier whose images should be confirmed.
   * @param entityType - (Optional) The type of entity to associate the images with.
   * @param entityId - (Optional) The ID of the entity to associate the images with.
   */
  async confirmSession(
    sessionId: string,
    entityType?: string,
    entityId?: string,
  ): Promise<number> {
    return this.imageRepository.confirmSession(
      sessionId,
      entityType,
      entityId,
    );
  }

  /**
   * Cancels a session and deletes all images associated with it that have not been confirmed.
   * This is used when a user cancels an operation and the uploaded images are no longer needed.
   *
   * @param sessionId - The session identifier whose images should be deleted.
   */
  async cancelSession(sessionId: string): Promise<number> {
    const images = await this.imageRepository.findUnconfirmedBySession(sessionId);

    // delete files
    for (const image of images) {
      await fs.unlink(image.path).catch(() => { });
    }

    // delete DB
    return this.imageRepository.cancelSession(sessionId);
  }

  /**
   * Deletes images by their IDs.
   * Throws ImageNotFoundException if any image is not found.
   * Deletes both the image files from storage and their metadata from the repository.
   *
   * @param ids - An array of image IDs to delete.
   */
  async deleteImages(ids: string[]): Promise<void> {
    const images = await this.imageRepository.findByIds(ids);

    if (images.length !== ids.length) {
      throw new ImageNotFoundException('One or more images not found');
    }

    // delete DB first
    await this.imageRepository.deleteMany(ids);

    // delete files (parallel, ignore errors)
    await Promise.all(
      images.map(img =>
        fs.unlink(img.path).catch(() => { }),
      ),
    );
  }

  /**
   * Retrieves an image by its ID.
   * Throws ImageNotFoundException if the image does not exist.
   *
   * @param id - The ID of the image to retrieve.
   * @returns The Image domain object.
   * @throws ImageNotFoundException if the image is not found.
   */
  async getImageById(id: string): Promise<Image> {
    const image = await this.imageRepository.findById(id);
    if (!image) throw new ImageNotFoundException(id);
    return image;
  }

  /**
   * Retrieves all images associated with a specific entity type and entity ID.
   *
   * @param entityType - The type of the entity (e.g., 'product').
   * @param entityId - The ID of the entity.
   * @returns An array of Image domain objects.
   */
  async getImagesByEntity(
    entityType: string,
    entityId: string,
  ): Promise<Image[]> {
    return await this.imageRepository.findByEntity(entityType, entityId);
  }

  /**
   * Retrieves all images associated with a specific session ID.
   *
   * @param sessionId - The session identifier.
   * @returns An array of Image domain objects.
   */
  async getImagesBySession(sessionId: string): Promise<Image[]> {
    return await this.imageRepository.findBySessionId(sessionId);
  }

  /**
   * Periodically cleans up orphaned images that are not confirmed and are older than two days.
   * Deletes both the image files from storage and their metadata from the repository.
   * This method is scheduled to run every 6 hours.
   *
   * @returns The number of orphaned images deleted.
   */
  @Cron(CronExpression.EVERY_6_HOURS)
  async cleanupOrphanedImages() {
    const twoDaysAgo = new Date(Date.now() - this.tempImageExpiryTime);
    const images = await this.imageRepository.findOrphanedImages(twoDaysAgo);
    if (!images.length) return 0;

    const ids = images.map(i => i.id!);

    // delete DB in bulk
    await this.imageRepository.deleteMany(ids);

    // delete files in parallel
    await Promise.all(
      images.map(img =>
        fs.unlink(img.path).catch(() => { }),
      ),
    );
    this.logger.debug(`Cleaned up ${images.length} orphaned images.`);
    return images.length;
  }
}
