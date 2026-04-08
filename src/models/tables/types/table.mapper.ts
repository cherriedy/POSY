import { Table as PrismaTable } from '@prisma/client';
import { Table as DomainTable } from './table.class';
import { MissingRequireFieldsException } from '../../../common/exceptions';
import { TableStatus } from '../enums';
import { ZoneMapper } from '../../zones/types';

export class TableMapper {
  static toDomain(this: void, prismaTable: PrismaTable): DomainTable {
    return new DomainTable(
      prismaTable.id,
      prismaTable.zone_id,
      prismaTable.name,
      prismaTable.hardware_id,
      prismaTable.current_token,
      prismaTable.capacity,
      prismaTable.status as TableStatus,
      prismaTable.pos_x,
      prismaTable.pos_y,
      prismaTable.is_active,
      prismaTable.created_at,
      prismaTable.updated_at,
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      (prismaTable as any).zone
        ? // eslint-disable-next-line @typescript-eslint/no-unsafe-argument,@typescript-eslint/no-unsafe-member-access
          ZoneMapper.toDomain((prismaTable as any).zone)
        : null,
    );
  }

  static toPrisma(this: void, domainTable: DomainTable) {
    if (!domainTable.name) {
      throw new MissingRequireFieldsException();
    }

    if (domainTable.capacity === null || domainTable.capacity === undefined) {
      throw new MissingRequireFieldsException();
    }

    return {
      name: domainTable.name,
      hardware_id: domainTable.hardwareId,
      current_token: domainTable.currentToken,
      zone_id: domainTable.zoneId ?? null,
      capacity: domainTable.capacity,
      status: domainTable.status,
      pos_x: domainTable.posX ?? null,
      pos_y: domainTable.posY ?? null,
      is_active: domainTable.isActive ?? true,
      created_at: domainTable.createdAt ?? new Date(),
      updated_at: domainTable.updatedAt ?? new Date(),
      ...(domainTable.id ? { id: domainTable.id } : {}),
    };
  }
}
