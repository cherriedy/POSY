import { Prisma, TableSession as PrismaTableSession } from '@prisma/client';
import { TableSession } from './table-session';
import { TableSessionStatus, TableSessionType } from '../enums';
import { TableMapper } from '../../../tables/types';
import { UserMapper } from '../../../users/types/user.mapper';
import { MissingRequireFieldsException } from '../../../../common/exceptions';

export class TableSessionMapper {
  /**
   * Converts a Prisma {@link PrismaTableSession} row into a domain
   * {@link TableSession} instance.
   *
   * This method ensures that the domain layer receives a clean, structured object
   * that is independent of the database implementation. Related entities like
   * `table` and `user` are mapped using their respective mappers if present.
   *
   * @param prisma - The raw Prisma row returned from the database, potentially including related entities.
   * @returns A hydrated {@link TableSession} domain entity.
   */
  static toDomain(this: void, prisma: PrismaTableSession): TableSession {
    return new TableSession(
      prisma.id,
      prisma.table_id,
      prisma.user_id,
      prisma.session_token,
      prisma.device_fingerprint,
      prisma.status as TableSessionStatus,
      prisma.session_type as TableSessionType,
      prisma.start_at,
      prisma.end_at,
      prisma.expires_at,
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      (prisma as any).table
        ? // eslint-disable-next-line @typescript-eslint/no-unsafe-argument,@typescript-eslint/no-unsafe-member-access
          TableMapper.toDomain((prisma as any).table)
        : null,
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      (prisma as any).user
        ? // eslint-disable-next-line @typescript-eslint/no-unsafe-argument,@typescript-eslint/no-unsafe-member-access
          UserMapper.toDomain((prisma as any).user)
        : null,
    );
  }

  /**
   * Converts a domain {@link TableSession} entity into a Prisma
   * {@link Prisma.TableSessionUncheckedCreateInput} payload, suitable for
   * `create` operations.
   *
   * @param domain - The domain entity to convert.
   * @returns The Prisma create-input payload.
   * @throws {MissingRequireFieldsException} If any required fields are missing in the domain entity.
   * @remarks Required fields for creation include: `tableId`, `status`, and `sessionType`.
   */
  static toPrismaCreateInput(
    this: void,
    domain: TableSession,
  ): Prisma.TableSessionUncheckedCreateInput {
    if (!domain.tableId || !domain.status || !domain.sessionType) {
      throw new MissingRequireFieldsException([
        'tableId',
        'status',
        'sessionType',
      ]);
    }
    return {
      table_id: domain.tableId,
      user_id: domain.userId,
      session_token: domain.sessionToken,
      device_fingerprint: domain.deviceFingerprint,
      status: domain.status,
      session_type: domain.sessionType,
      start_at: domain.startAt,
      end_at: domain.endAt,
      expires_at: domain.expiresAt,
    };
  }

  /**
   * Converts a partial domain {@link TableSession} entity into a Prisma
   * {@link Prisma.TableSessionUncheckedUpdateInput} payload, suitable for
   * `update` operations.
   *
   * This method selectively includes only the fields present in the partial
   * entity, making it efficient for updates.
   *
   * @param entity - The partial domain entity containing fields to be updated.
   * @returns The Prisma update-input payload.
   * @remarks Supported fields for update include: `status`, `startAt`, and `endAt`.
   * Other fields are typically immutable after creation and should not be included
   * in updates.
   */
  static toPrismaUpdateInput(
    entity: Partial<TableSession>,
  ): Prisma.TableSessionUncheckedUpdateInput {
    const data: Prisma.TableSessionUncheckedUpdateInput = {};
    if (entity.status) {
      data.status = entity.status;
    }
    if (entity.startAt) {
      data.start_at = entity.startAt;
    }
    if (entity.endAt) {
      data.end_at = entity.endAt;
    }
    return data;
  }
}
