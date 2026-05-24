import { ImageRepository } from './image-repository.abstract';
import { Image } from '../entities/image';
import { ImageMapper } from '../entities/image.mapper';
import { PrismaService } from '@posy/shared';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/client';
import { DuplicateEntryError } from '@posy/shared';
import { Injectable } from '@nestjs/common';
import { ImageNotFoundError } from '../errors/image-not-found.error';

@Injectable()
export class PrismaImageRepository implements ImageRepository {
  constructor(private readonly prismaService: PrismaService) {}

  async create(entity: Image): Promise<Image> {
    const prismaImage = ImageMapper.toPrisma(entity);
    try {
      return await this.prismaService.image
        .create({ data: prismaImage })
        .then(ImageMapper.toDomain);
    } catch (e) {
      if (e instanceof PrismaClientKnownRequestError) {
        if (e.code === 'P2002') {
          throw new DuplicateEntryError(
            'Image with provided unique field already exists',
          );
        }
      }
      throw e;
    }
  }

  async findById(id: string): Promise<Image | null> {
    const prismaImage = await this.prismaService.image.findUnique({
      where: { id },
    });

    return prismaImage ? ImageMapper.toDomain(prismaImage) : null;
  }

  async findBySessionId(sessionId: string): Promise<Image[]> {
    const images = await this.prismaService.image.findMany({
      where: { session_id: sessionId },
    });

    return images.map((i) => ImageMapper.toDomain(i));
  }

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

  async cancelSession(sessionId: string): Promise<number> {
    const result = await this.prismaService.image.deleteMany({
      where: {
        session_id: sessionId,
        is_confirmed: false,
      },
    });

    return result.count;
  }

  async findOrphanedImages(olderThan: Date): Promise<Image[]> {
    const images = await this.prismaService.image.findMany({
      where: {
        is_confirmed: false,
        created_at: { lt: olderThan },
      },
    });

    return images.map((i) => ImageMapper.toDomain(i));
  }

  async findUnconfirmedBySession(sessionId: string): Promise<Image[]> {
    const images = await this.prismaService.image.findMany({
      where: {
        session_id: sessionId,
        is_confirmed: false,
      },
    });

    return images.map(ImageMapper.toDomain);
  }

  async findByIds(ids: string[]): Promise<Image[]> {
    const data = await this.prismaService.image.findMany({
      where: {
        id: { in: ids },
      },
    });

    return data.map(ImageMapper.toDomain);
  }

  async deleteMany(ids: string[]): Promise<void> {
    await this.prismaService.image.deleteMany({
      where: {
        id: { in: ids },
      },
    });
  }
}
