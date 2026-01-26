import { Image as PrismaImage } from '@prisma/client';
import { Image as DomainImage } from './image.class';
import { MissingRequireFieldsException } from '../../../common/exceptions';

export class ImageMapper {
  static toDomain(this: void, prismaImage: PrismaImage): DomainImage {
    return new DomainImage(
      prismaImage.id,
      prismaImage.file_name,
      prismaImage.original_name,
      prismaImage.mime_type,
      prismaImage.size,
      prismaImage.path,
      prismaImage.entity_type,
      prismaImage.entity_id,
      prismaImage.session_id,
      prismaImage.is_confirmed,
      prismaImage.created_at,
      prismaImage.updated_at,
    );
  }

  static toPrisma(this: void, domainImage: DomainImage) {
    if (
      !domainImage.fileName ||
      !domainImage.originalName ||
      !domainImage.mimeType ||
      !domainImage.path
    ) {
      throw new MissingRequireFieldsException([
        'fileName',
        'originalName',
        'mimeType',
        'path',
      ]);
    }

    return {
      file_name: domainImage.fileName,
      original_name: domainImage.originalName,
      mime_type: domainImage.mimeType,
      size: domainImage.size,
      path: domainImage.path,
      entity_type: domainImage.entityType,
      entity_id: domainImage.entityId,
      session_id: domainImage.sessionId ?? null,
      is_confirmed: domainImage.isConfirmed ?? false,
      created_at: domainImage.createdAt ?? new Date(),
      updated_at: domainImage.updatedAt ?? new Date(),
      ...(domainImage.id ? { id: domainImage.id } : {}),
    };
  }

  static fileToDomain(
    this: void,
    file: Express.Multer.File,
    sessionId: string,
    entityType?: string,
    entityId?: string,
  ): DomainImage {
    return new DomainImage(
      null,
      file.filename,
      file.originalname,
      file.mimetype,
      file.size,
      file.path,
      entityType || null,
      entityId || null,
      sessionId,
      false,
      null,
      null,
    );
  }
}
