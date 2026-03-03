import { TableSession as PrismaTableSession } from '@prisma/client';
import { TableSession as DomainTableSession } from './table-session.class';
import { TableSessionStatus } from '../enums';
import { MissingRequireFieldsException } from '../../../common/exceptions';
import { TableMapper } from '../../tables/types';

export class TableSessionMapper {
  static toDomain(
    this: void,
    prismaTableSession: PrismaTableSession,
  ): DomainTableSession {
    return new DomainTableSession(
      prismaTableSession.id,
      prismaTableSession.table_id,
      prismaTableSession.created_by,
      prismaTableSession.session_token,
      prismaTableSession.device_fingerprint,
      prismaTableSession.status as TableSessionStatus,
      prismaTableSession.start_at,
      prismaTableSession.end_at,
      prismaTableSession.expires_at,
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access,@typescript-eslint/no-unsafe-argument
      (prismaTableSession as any).table ??
        // eslint-disable-next-line @typescript-eslint/no-unsafe-argument,@typescript-eslint/no-unsafe-member-access
        TableMapper.toDomain((prismaTableSession as any).table),
    );
  }

  static toPrisma(this: void, domainTableSession: DomainTableSession) {
    if (
      !domainTableSession.tableId ||
      !domainTableSession.sessionToken ||
      !domainTableSession.deviceFingerprint ||
      !domainTableSession.expiresAt
    ) {
      throw new MissingRequireFieldsException();
    }

    return {
      table_id: domainTableSession.tableId,
      created_by: domainTableSession.createdBy,
      session_token: domainTableSession.sessionToken,
      device_fingerprint: domainTableSession.deviceFingerprint,
      status: domainTableSession.status,
      start_at: domainTableSession.startAt,
      end_at: domainTableSession.endAt,
      expires_at: domainTableSession.expiresAt,
      ...(domainTableSession.id ? { id: domainTableSession.id } : {}),
    };
  }
}
