import { Image } from '../entities/image';
import { BaseRepository } from '@posy/shared';

export abstract class ImageRepository implements BaseRepository<Image> {
  abstract create(entity: Image): Promise<Image>;
  abstract findById(id: string): Promise<Image | null>;
  abstract findBySessionId(sessionId: string): Promise<Image[]>;
  abstract findByEntity(entityType: string, entityId: string): Promise<Image[]>;
  abstract confirmSession(
    sessionId: string,
    entityType?: string,
    entityId?: string,
  ): Promise<number>;
  abstract cancelSession(sessionId: string): Promise<number>;
  abstract findOrphanedImages(olderThan: Date): Promise<Image[]>;
  abstract findUnconfirmedBySession(sessionId: string): Promise<Image[]>;
  abstract deleteMany(ids: string[]): Promise<void>;
  abstract findByIds(ids: string[]): Promise<Image[]>;
}
