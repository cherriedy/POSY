import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { TableSessionRepository } from '../../shared/repositories/table-session-repository.abstract';
import { TableSession } from '../../shared/entities/table-session';
import { TableSessionStatus } from '../../shared/enums/table-session-status.enum';
import { TableSessionType } from '../../shared/enums/table-session-type.enum';
import { DeviceFingerprintUtility } from '../../shared/utilities/device-fingerprint.utility';
import { TableSessionPayload } from '../../shared/interfaces/table-session-payload.interface';
import { UnavailableTableException } from '../../shared/exceptions/unavailable-table.exception';
import { TableRepository } from 'src/models/tables/repositories/table-repository.abstract';
import { TableSessionConfig } from '../../table-session.config';
import { TableNotFoundException } from 'src/models/tables/exceptions/table-not-found.exception';
import { TableTokenInvalidException } from 'src/models/tables/exceptions/table-token-invalid.exception';

@Injectable()
export class GuestSessionContextService {
  constructor(
    private readonly tableSessionRepository: TableSessionRepository,
    private readonly tableRepository: TableRepository,
    private readonly jwtService: JwtService,
    private readonly tableSessionConfig: TableSessionConfig,
  ) {}

  async execute(
    userAgent: string,
    ipAddress: string,
    tableId: string,
    tableToken: string,
  ): Promise<TableSession | null> {
    // Verify table exists and is available
    const table = await this.tableRepository.findById(tableId);
    if (!table) throw new TableNotFoundException(tableId);
    if (!table.isActive) throw new UnavailableTableException(tableId);

    // If table has no current token or tokens don't match, reject
    if (!table.currentToken || table.currentToken !== tableToken) {
      throw new TableTokenInvalidException(tableId);
    }

    // Generate device fingerprint from request
    const fingerprint = DeviceFingerprintUtility.generate(userAgent, ipAddress);

    // Check for existing active session
    const existing =
      await this.tableSessionRepository.findActiveByTableId(tableId);

    // If an active session exists, verify the device fingerprint matches. If it doesn't match,
    // return null to indicate session cannot be started from this device
    if (existing) {
      return existing.deviceFingerprint !== fingerprint ? null : existing;
    }

    // Generate JWT session token with device fingerprint
    const expiresAt = new Date();
    expiresAt.setSeconds(
      expiresAt.getSeconds() + this.tableSessionConfig.jwt.expiresIn,
    );

    const payload = {
      tableId,
      userId: null,
      fingerprint,
      type: 'table_session',
    } as TableSessionPayload;

    const sessionToken = await this.jwtService.signAsync(payload, {
      secret: this.tableSessionConfig.jwt.secret,
      expiresIn: this.tableSessionConfig.jwt.expiresIn,
    });

    // Create new session with device fingerprint
    const newSession = new TableSession(
      null,
      tableId,
      null,
      sessionToken,
      fingerprint,
      TableSessionStatus.ACTIVE,
      TableSessionType.GUEST,
      new Date(),
      null,
      expiresAt,
      null,
      null,
    );

    return await this.tableSessionRepository.create(newSession);
  }
}
