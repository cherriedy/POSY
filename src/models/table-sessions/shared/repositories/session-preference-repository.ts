import { Injectable } from '@nestjs/common';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/client';
import { DuplicateEntryException } from '../../../../common/exceptions';
import { PrismaService } from '../../../../providers/prisma/prisma.service';
import { SessionPreferenceNotFoundException } from '../exceptions';
import { SessionPreference, SessionPreferenceMapper } from '../entities';
import { SessionPreferenceRepository } from './session-preference-repository.abstract';

@Injectable()
export class SessionPreferenceRepositoryImpl implements SessionPreferenceRepository {
  constructor(private readonly prismaService: PrismaService) {}

  /**
   * Creates a new session preference record in the database.
   *
   * @param entity - The domain entity to be created.
   * @returns A promise that resolves to the created domain entity.
   * @throws {DuplicateEntryException} If a session preference with the same session ID already exists.
   */
  async create(entity: SessionPreference): Promise<SessionPreference> {
    const prismaEntity = SessionPreferenceMapper.toPrismaCreateInput(entity);
    try {
      const result = await this.prismaService.sessionPreference.create({
        data: prismaEntity,
      });
      return SessionPreferenceMapper.toDomain(result);
    } catch (e) {
      if (e instanceof PrismaClientKnownRequestError) {
        if (e.code === 'P2002') {
          throw new DuplicateEntryException(
            'Session preference with provided session ID already exists',
          );
        }
      }
      throw e;
    }
  }

  /**
   * Finds a session preference by its unique ID.
   *
   * @param id - The unique identifier of the session preference.
   * @returns A promise that resolves to the domain entity or `null` if not found.
   */
  async findById(id: string): Promise<SessionPreference | null> {
    const result = await this.prismaService.sessionPreference.findUnique({
      where: { id },
    });
    return result ? SessionPreferenceMapper.toDomain(result) : null;
  }

  /**
   * Deletes a session preference from the database by its unique ID.
   *
   * @param id - The unique ID of the session preference to delete.
   * @returns A promise that resolves when the operation is complete.
   * @throws {SessionPreferenceNotFoundException} If the record to be deleted is not found.
   */
  async delete(id: string): Promise<void> {
    try {
      await this.prismaService.sessionPreference.delete({
        where: { id },
      });
    } catch (e) {
      if (e instanceof PrismaClientKnownRequestError) {
        if (e.code === 'P2025') {
          throw new SessionPreferenceNotFoundException();
        }
      }
      throw e;
    }
  }

  /**
   * Updates a session preference in the database by its unique ID.
   *
   * @param id - The unique ID of the session preference to update.
   * @param entity - A partial domain entity with the fields to update.
   * @returns A promise that resolves to the updated domain entity.
   * @throws {SessionPreferenceNotFoundException} If the record to be updated is not found.
   * @throws {DuplicateEntryException} If the update would result in a duplicate session ID.
   */
  async update(
    id: string,
    entity: Partial<SessionPreference>,
  ): Promise<SessionPreference> {
    const data = SessionPreferenceMapper.toPrismaUpdateInput(entity);
    try {
      const result = await this.prismaService.sessionPreference.update({
        where: { id },
        data,
      });
      return SessionPreferenceMapper.toDomain(result);
    } catch (e) {
      if (e instanceof PrismaClientKnownRequestError) {
        if (e.code === 'P2025') {
          throw new SessionPreferenceNotFoundException();
        } else if (e.code === 'P2002') {
          throw new DuplicateEntryException(
            'Session preference with provided session ID already exists',
          );
        }
      }
      throw e;
    }
  }

  /**
   * Finds a session preference by its associated session ID.
   *
   * @param sessionId - The unique ID of the session.
   * @returns A promise that resolves to the domain entity or `null` if not found.
   */
  async findBySessionId(sessionId: string): Promise<SessionPreference | null> {
    const result = await this.prismaService.sessionPreference.findUnique({
      where: { session_id: sessionId },
    });
    return result ? SessionPreferenceMapper.toDomain(result) : null;
  }

  /**
   * Updates a session preference in the database by its associated session ID.
   *
   * @param sessionId - The unique ID of the session whose preference is to be updated.
   * @param entity - A partial domain entity with the fields to update.
   * @returns A promise that resolves to the updated domain entity.
   * @throws {SessionPreferenceNotFoundException} If the record to be updated is not found.
   * @throws {DuplicateEntryException} If the update would result in a duplicate session ID.
   */
  async updateBySessionId(
    sessionId: string,
    entity: Partial<SessionPreference>,
  ): Promise<SessionPreference> {
    const data = SessionPreferenceMapper.toPrismaUpdateInput(entity);
    try {
      const result = await this.prismaService.sessionPreference.update({
        where: { session_id: sessionId },
        data,
      });
      return SessionPreferenceMapper.toDomain(result);
    } catch (e) {
      if (e instanceof PrismaClientKnownRequestError) {
        if (e.code === 'P2025') {
          throw new SessionPreferenceNotFoundException();
        } else if (e.code === 'P2002') {
          throw new DuplicateEntryException(
            'Session preference with provided session ID already exists',
          );
        }
      }
      throw e;
    }
  }
}
