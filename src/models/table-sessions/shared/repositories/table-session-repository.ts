import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/providers/prisma/prisma.service';
import { TableSession, TableSessionMapper } from '../entities';
import { TableSessionStatus } from '../enums';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/client';
import {
  DuplicateEntryException,
  ForeignKeyViolationException,
} from '../../../../common/exceptions';
import { TableSessionNotFoundException } from '../exceptions';
import { TableSessionRepository } from './table-session-repository.abstract';

@Injectable()
export class TableSessionRepositoryImpl implements TableSessionRepository {
  constructor(private readonly prismaService: PrismaService) {}

  /**
   * Creates a new table session in the database.
   *
   * @param entity - The table session entity to create.
   * @returns A promise that resolves to the created table session.
   * @throws DuplicateEntryException if a session with the same token already exists.
   * @throws ForeignKeyViolationException if the table or user reference is invalid.
   */
  async create(entity: TableSession): Promise<TableSession> {
    const prismaTableSession = TableSessionMapper.toPrismaCreateInput(entity);
    try {
      return await this.prismaService.tableSession
        .create({
          data: prismaTableSession,
          include: { table: true },
        })
        .then(TableSessionMapper.toDomain);
    } catch (e) {
      if (e instanceof PrismaClientKnownRequestError) {
        if (e.code === 'P2002') {
          throw new DuplicateEntryException(
            'Session with provided token already exists',
          );
        }
        if (e.code === 'P2003') {
          throw new ForeignKeyViolationException({
            message: 'Table or user reference is invalid',
          });
        }
      }
      throw e;
    }
  }

  /**
   * Finds a table session by its unique ID.
   *
   * @param id - The unique identifier of the table session.
   * @returns A promise that resolves to the table session if found, otherwise null.
   */
  async findById(id: string): Promise<TableSession | null> {
    const prismaTableSession = await this.prismaService.tableSession.findUnique(
      {
        where: { id },
        include: { table: true },
      },
    );

    return prismaTableSession
      ? TableSessionMapper.toDomain(prismaTableSession)
      : null;
  }

  /**
   * Updates an existing table session by its unique ID.
   *
   * @param id - The unique identifier of the table session to update.
   * @param entity - Partial data to update the table session with.
   * @returns A promise that resolves to the updated table session.
   * @throws TableSessionNotFoundException if the session is not found.
   */
  async update(
    id: string,
    entity: Partial<TableSession>,
  ): Promise<TableSession> {
    const data = TableSessionMapper.toPrismaUpdateInput(entity);
    try {
      return await this.prismaService.tableSession
        .update({
          where: { id },
          data,
          include: { table: true },
        })
        .then(TableSessionMapper.toDomain);
    } catch (e) {
      if (e instanceof PrismaClientKnownRequestError) {
        if (e.code === 'P2025') {
          throw new TableSessionNotFoundException();
        }
      }
      throw e;
    }
  }

  /**
   * Finds the active session for a specific table.
   *
   * @param tableId - The unique identifier of the table.
   * @returns A promise that resolves to the active table session or null if not found.
   */
  async findActiveByTableId(tableId: string): Promise<TableSession | null> {
    const session = await this.prismaService.tableSession.findFirst({
      where: {
        table_id: tableId,
        status: TableSessionStatus.ACTIVE,
        OR: [{ expires_at: null }, { expires_at: { gt: new Date() } }],
      },
      include: {
        table: true,
      },
      orderBy: {
        start_at: 'desc',
      },
    });

    return session ? TableSessionMapper.toDomain(session) : null;
  }

  /**
   * Finds a table session by its session token.
   * @param sessionToken - The session token to search for.
   * @returns A promise that resolves to the table session or null if not found.
   */
  async findByToken(sessionToken: string): Promise<TableSession | null> {
    const session = await this.prismaService.tableSession.findUnique({
      where: {
        session_token: sessionToken,
      },
      include: {
        table: true,
      },
    });

    return session ? TableSessionMapper.toDomain(session) : null;
  }

  /**
   * Ends a table session by marking it as completed.
   * @param sessionId - The unique identifier of the session to end.
   * @returns A promise that resolves to the updated table session.
   * @throws TableSessionNotFoundException if the session is not found.
   */
  async endSession(sessionId: string): Promise<TableSession> {
    try {
      return await this.prismaService.tableSession
        .update({
          where: {
            id: sessionId,
          },
          data: {
            status: TableSessionStatus.COMPLETED,
            end_at: new Date(),
          },
          include: { table: true },
        })
        .then(TableSessionMapper.toDomain);
    } catch (e) {
      if (e instanceof PrismaClientKnownRequestError) {
        if (e.code === 'P2025') {
          throw new TableSessionNotFoundException();
        }
      }
      throw e;
    }
  }

  /**
   * Invalidates all expired sessions by marking them as cancelled.
   * @returns A promise that resolves to the number of sessions invalidated.
   */
  async invalidateExpiredSessions(): Promise<number> {
    const result = await this.prismaService.tableSession.updateMany({
      where: {
        status: TableSessionStatus.ACTIVE,
        expires_at: {
          lt: new Date(),
        },
      },
      data: {
        status: TableSessionStatus.CANCELLED,
        end_at: new Date(),
      },
    });

    return result.count;
  }
}
