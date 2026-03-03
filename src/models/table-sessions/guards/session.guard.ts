// noinspection ExceptionCaughtLocallyJS

import {
  BadRequestException,
  CanActivate,
  ExecutionContext,
  Injectable,
  InternalServerErrorException,
  UnauthorizedException,
} from '@nestjs/common';
import { JsonWebTokenError, JwtService, TokenExpiredError } from '@nestjs/jwt';
import { Request } from 'express';
import { TableSessionRepository } from '../repositories';
import { TableSessionConfig } from '../table-session.config';
import { TableSessionStatus } from '../enums';
import { DeviceFingerprintUtility } from '../utilities';

class InvalidSessionTokenException extends UnauthorizedException {
  constructor() {
    super('Invalid or expired session token');
  }
}

@Injectable()
export class SessionGuard implements CanActivate {
  constructor(
    private readonly jwtService: JwtService,
    private readonly tableSessionRepository: TableSessionRepository,
    private readonly tableSessionConfig: TableSessionConfig,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();

    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const userAgent = request['device'];
    if (
      userAgent ||
      typeof userAgent !== 'string' ||
      userAgent === 'Unknown device'
    ) {
      throw new BadRequestException(
        'Unable to determine client device information',
      );
    }

    const ipAddress = request['ip'];
    if (!ipAddress) {
      throw new BadRequestException(
        'Unable to determine client IP address information',
      );
    }

    // Extract session token from cookie
    const cookieName = this.tableSessionConfig.cookie.name;
    const token = request.cookies?.[cookieName] as string;
    if (!token) throw new InvalidSessionTokenException();

    try {
      // Verify JWT token and extract payload
      const secret = this.tableSessionConfig.jwt.secret;
      await this.jwtService.verifyAsync(token, { secret });
    } catch (error) {
      if (
        error instanceof JsonWebTokenError ||
        error instanceof TokenExpiredError
      ) {
        throw new InvalidSessionTokenException();
      }
    }

    try {
      // Verify session exists in database and is active
      const session = await this.tableSessionRepository.findByToken(token);
      if (!session) throw new InvalidSessionTokenException();

      // Check if session is still active and not expired
      if (
        session.status !== TableSessionStatus.ACTIVE ||
        new Date() > session.expiresAt
      ) {
        throw new InvalidSessionTokenException();
      }

      // CRITICAL: Only the device that scanned the QR code can make requests
      const isValidDevice = DeviceFingerprintUtility.validate(
        userAgent,
        ipAddress,
        session.deviceFingerprint,
      );
      if (!isValidDevice) {
        throw new InvalidSessionTokenException();
      }

      // Attach session info to request for use in controllers
      request['session'] = session;
      return true;
    } catch (error) {
      if (
        error instanceof BadRequestException ||
        error instanceof InvalidSessionTokenException
      ) {
        throw error;
      }
      throw new InternalServerErrorException(
        'Failed to validate session token',
      );
    }
  }
}
