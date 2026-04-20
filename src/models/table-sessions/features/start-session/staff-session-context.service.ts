import { Injectable } from '@nestjs/common';
import {
  TableSessionRepository,
  TableSession,
  TableSessionStatus,
  TableSessionType,
  UnavailableTableException,
  TableSessionNotFoundException,
} from '../../shared';
import { TableRepository } from 'src/models/tables/repositories';
import { TableNotFoundException } from 'src/models/tables/exceptions';
import { DuplicateEntryException } from 'src/common/exceptions';

@Injectable()
export class StaffSessionContextService {
  constructor(
    private readonly tableSessionRepository: TableSessionRepository,
    private readonly tableRepository: TableRepository,
  ) {}

  /**
   * This method allows staff members to get the active session for a table or create a new one if none exists.
   *
   * @param tableId The ID of the table interacted with by staff.
   * @param userId The ID of the staff member initiating the action.
   * @returns The sessionId and tableId of the active or newly created TableSession.
   */
  // async execute(
  //   tableId: string,
  //   userId: string,
  // ): Promise<{ sessionId: string; tableId: string }> {
  //   const table = await this.tableRepository.findById(tableId);
  //   if (!table) throw new TableNotFoundException(tableId);
  //   if (!table.isActive) throw new UnavailableTableException(tableId);

  //   const existing =
  //     await this.tableSessionRepository.findActiveByTableId(tableId);

  //   // Since the staff members are able to access the session from any device,
  //   // we do not enforce device fingerprint matching for them.
  //   if (existing) {
  //     return {
  //       sessionId: existing.id!,
  //       tableId: existing.tableId,
  //     };
  //   }

  //   // If no active session exists, create a new one associated with the staff member.
  //   // Since this is a staff-managed session, we do not generate a JWT token or set a
  //   // device fingerprint.
  //   const pending = new TableSession(
  //     null,
  //     tableId,
  //     userId,
  //     null,
  //     null,
  //     TableSessionStatus.ACTIVE,
  //     TableSessionType.STAFF,
  //     new Date(),
  //     null,
  //     null,
  //     null,
  //     null,
  //   );

  //   const created = await this.tableSessionRepository.create(pending);
  //   return { sessionId: created.id!, tableId: created.tableId };
  // }

  async createSessionForOrder(
    tableId: string,
    userId: string,
  ): Promise<{ sessionId: string; tableId: string }> {
    const table = await this.tableRepository.findById(tableId);
    if (!table) throw new TableNotFoundException(tableId);
    if (!table.isActive) throw new UnavailableTableException(tableId);

    const existing =
      await this.tableSessionRepository.findActiveByTableId(tableId);

    if (existing) {
      throw new DuplicateEntryException(
        'Table already has an active session. Cannot create new order.',
      );
    }

    const pending = new TableSession(
      null,
      tableId,
      userId,
      null,
      null,
      TableSessionStatus.ACTIVE,
      TableSessionType.STAFF,
      new Date(),
      null,
      null,
      null,
      null,
    );

    const created = await this.tableSessionRepository.create(pending);

    return {
      sessionId: created.id!,
      tableId: created.tableId,
    };
  }

  async getActiveSessionForOrder(
    tableId: string,
  ): Promise<{ sessionId: string; tableId: string }> {
    const table = await this.tableRepository.findById(tableId);
    if (!table) throw new TableNotFoundException(tableId);

    const existing =
      await this.tableSessionRepository.findActiveByTableId(tableId);

    if (!existing) {
      throw new TableSessionNotFoundException();
    }

    return {
      sessionId: existing.id!,
      tableId: existing.tableId,
    };
  }
}
