import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { TableSessionRepository } from '../repositories';
import { TableRepository } from 'src/models/tables/repositories';
import { TableSessionConfig } from '../table-session.config';
import { TableNotFoundException } from 'src/models/tables/exceptions';
import { TableSession } from '../types';
import { TableSessionStatus } from '../enums';
import { DeviceFingerprintUtility } from '../utilities';
import { TableSessionPayload } from '../interfaces';
import { UnavailableTableException } from '../exceptions';

@Injectable()
export class StartSessionService {
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
    userId?: string,
  ): Promise<TableSession | null> {
    // Verify table exists and is available
    const table = await this.tableRepository.findById(tableId);
    if (!table) throw new TableNotFoundException(tableId);
    if (!table.isActive) throw new UnavailableTableException(tableId);

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
      userId,
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
      userId || null,
      sessionToken,
      fingerprint,
      TableSessionStatus.ACTIVE,
      new Date(), // startAt
      null, // endAt
      expiresAt,
      null,
    );

    return await this.tableSessionRepository.create(newSession);
  }
}
