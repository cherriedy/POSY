import { Floor as PrismaFloor } from '@prisma/client';
import { Floor as DomainFloor } from './floor.class';
import { MissingRequireFieldsException } from '../../../common/exceptions';
import { TableMapper } from '../../tables/types';

export class FloorMapper {
  static toDomain(this: void, prismaFloor: PrismaFloor): DomainFloor {
    return new DomainFloor(
      prismaFloor.id,
      prismaFloor.name,
      prismaFloor.order,
      prismaFloor.is_active,
      prismaFloor.created_at,
      prismaFloor.updated_at,
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      (prismaFloor as any).tables
        ? // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access,@typescript-eslint/no-unsafe-call
          (prismaFloor as any).tables.map((table: any) =>
            TableMapper.toDomain(table),
          )
        : null,
    );
  }

  static toPrisma(this: void, domainFloor: DomainFloor) {
    if (!domainFloor.name) {
      throw new MissingRequireFieldsException();
    }

    if (domainFloor.order === null || domainFloor.order === undefined) {
      throw new MissingRequireFieldsException();
    }

    return {
      name: domainFloor.name,
      order: domainFloor.order,
      is_active: domainFloor.isActive ?? true,
      created_at: domainFloor.createdAt ?? new Date(),
      updated_at: domainFloor.updatedAt ?? new Date(),
      ...(domainFloor.id ? { id: domainFloor.id } : {}),
    };
  }
}
