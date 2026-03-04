import { Zone as PrismaZone } from '@prisma/client';
import { Zone as DomainZone } from './zone.class';
import { MissingRequireFieldsException } from '../../../common/exceptions';
import { TableMapper } from '../../tables/types';
import { FloorMapper } from 'src/models/floors/types';

export class ZoneMapper {
  static toDomain(this: void, prismaZone: PrismaZone): DomainZone {
    return new DomainZone(
      prismaZone.id,
      prismaZone.name,
      prismaZone.description,
      prismaZone.is_active,
      prismaZone.floor_id,
      prismaZone.created_at,
      prismaZone.updated_at,
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      (prismaZone as any).tables
        ? // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access,@typescript-eslint/no-unsafe-call
        (prismaZone as any).tables.map((table: any) =>
          TableMapper.toDomain(table),
        )
        : null,

      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      (prismaZone as any).floor
        ? // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access,@typescript-eslint/no-unsafe-argument
        FloorMapper.toDomain((prismaZone as any).floor)
        : undefined,
    );
  }

  static toPrisma(this: void, domainZone: DomainZone) {
    if (!domainZone.name) {
      throw new MissingRequireFieldsException();
    }

    return {
      name: domainZone.name,
      description: domainZone.description ?? null,
      is_active: domainZone.isActive ?? true,
      created_at: domainZone.createdAt ?? new Date(),
      updated_at: domainZone.updatedAt ?? new Date(),
      floor_id: domainZone.floorId,
      ...(domainZone.id ? { id: domainZone.id } : {}),
    };
  }
}
