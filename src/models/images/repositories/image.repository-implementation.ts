import { ImageRepository } from './image.repository-abstract';
import { Image, ImageMapper } from '../types';
import { PrismaService } from '../../../providers/prisma/prisma.service';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/client';
import { DuplicateEntryException } from '../../../common/exceptions';
import { Injectable } from '@nestjs/common';
import { ImageNotFoundException } from '../exceptions';

@Injectable()
export class ImageRepositoryImpl implements ImageRepository {
  constructor(private readonly prismaService: PrismaService) {}

  /**
   * Creates a new image in the database.
   * @param entity - The image entity to create.
   * @returns A promise that resolves to the created image.
   * @throws DuplicateEntryException if an image with a unique field already exists.
   */
  async create(entity: Image): Promise<Image> {
    const prismaImage = ImageMapper.toPrisma(entity);
    try {
      return await this.prismaService.image
        .create({ data: prismaImage })
        .then(ImageMapper.toDomain);
    } catch (e) {
      if (e instanceof PrismaClientKnownRequestError) {
        if (e.code === 'P2002') {
          throw new DuplicateEntryException(
            'Image with provided unique field already exists',
          );
        }
      }
      throw e;
    }
  }

  /**
   * Deletes an image by its unique identifier.
   * @param id - The unique identifier of the image to delete.
   * @returns A promise that resolves when the image is deleted.
   * @throws ImageNotFoundException if the image does not exist.
   */
  async delete(id: string): Promise<void> {
    try {
      await this.prismaService.image.delete({ where: { id } });
    } catch (e) {
      if (e instanceof PrismaClientKnownRequestError) {
        if (e.code === 'P2025') {
          throw new ImageNotFoundException(id);
        }
      }
      throw e;
    }
  }

  /**
   * Finds an image by its unique identifier.
   * @param id - The unique identifier of the image to find.
   * @returns A promise that resolves to the found image or null if not found.
   */
  async findById(id: string): Promise<Image | null> {
    const prismaImage = await this.prismaService.image.findUnique({
      where: { id },
    });

    return prismaImage ? ImageMapper.toDomain(prismaImage) : null;
  }

  /**
   * Finds all images by session ID.
   * @param sessionId - The session ID to filter images.
   * @returns A promise that resolves to an array of images.
   */
  async findBySessionId(sessionId: string): Promise<Image[]> {
    const images = await this.prismaService.image.findMany({
      where: { session_id: sessionId },
    });

    return images.map((i) => ImageMapper.toDomain(i));
  }

  /**
   * Finds all images by entity type and entity ID.
   * @param entityType - The entity type (e.g., 'USER', 'PRODUCT').
   * @param entityId - The entity ID.
   * @returns A promise that resolves to an array of confirmed images.
   */
  async findByEntity(entityType: string, entityId: string): Promise<Image[]> {
    const images = await this.prismaService.image.findMany({
      where: {
        entity_type: entityType,
        entity_id: entityId,
        is_confirmed: true,
      },
    });

    return images.map((i) => ImageMapper.toDomain(i));
  }

  /**
   * Confirms all images in a session by updating their confirmation status.
   * @param sessionId - The session ID to confirm.
   * @param entityType - Optional entity type to associate with the images.
   * @param entityId - Optional entity ID to associate with the images.
   * @returns A promise that resolves to the number of images updated.
   */
  async confirmSession(
    sessionId: string,
    entityType?: string,
    entityId?: string,
  ): Promise<number> {
    const result = await this.prismaService.image.updateMany({
      where: { session_id: sessionId },
      data: {
        is_confirmed: true,
        ...(entityType && { entity_type: entityType }),
        ...(entityId && { entity_id: entityId }),
      },
    });

    return result.count;
  }

  /**
   * Cancels a session by deleting all unconfirmed images.
   * @param sessionId - The session ID to cancel.
   * @returns A promise that resolves to the number of images deleted.
   */
  async cancelSession(sessionId: string): Promise<number> {
    const result = await this.prismaService.image.deleteMany({
      where: {
        session_id: sessionId,
        is_confirmed: false,
      },
    });

    return result.count;
  }

  /**
   * Finds orphaned images that are unconfirmed and older than the specified date.
   * @param olderThan - The date threshold for finding orphaned images.
   * @returns A promise that resolves to an array of orphaned images.
   */
  async findOrphanedImages(olderThan: Date): Promise<Image[]> {
    const images = await this.prismaService.image.findMany({
      where: {
        is_confirmed: false,
        created_at: { lt: olderThan },
      },
    });

    return images.map((i) => ImageMapper.toDomain(i));
  }

  /**
   * Deletes multiple images by their IDs.
   * @param ids - The array of image IDs to delete.
   * @returns A promise that resolves to the number of images deleted.
   */
  async deleteMany(ids: string[]): Promise<number> {
    const result = await this.prismaService.image.deleteMany({
      where: {
        id: { in: ids },
      },
    });

    return result.count;
  }
}
