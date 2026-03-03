import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { SessionGuard } from '../../table-sessions/guards';
import { AuthGuard } from '@nestjs/passport';

/**
 * Composite authorization guard that grants access if **either** of two strategies succeeds:
 *
 * 1. **JWT Authentication (`AuthGuard('jwt')`)**
 *    - Validates a Bearer token.
 *    - Intended for authenticated staff users.
 *    - Completely bypasses device/session fingerprint validation.
 *
 * 2. **SessionGuard**
 *    - Validates the original device that scanned the QR code.
 *    - Used for guest/table-session access.
 *
 * ### Authorization Flow
 * - The guard attempts JWT authentication first.
 * - If a valid JWT is present, access is immediately granted.
 * - If JWT validation fails (missing/invalid token), it silently falls back
 *   to `SessionGuard`.
 * - Access is denied only if **both** strategies fail.
 *
 * ### Design Rationale
 * - Prioritizing JWT ensures staff requests are not blocked by
 *   device fingerprint or session constraints.
 * - Enables unified route protection for endpoints accessible by
 *   both staff and guest-session users.
 *
 * ### Usage
 * Apply this guard to routes that should be accessible by:
 * - Authenticated staff members (via JWT), OR
 * - Guests accessing via a QR-scanned session.
 *
 * @example
 * ```ts
 * @UseGuards(SessionOrJwtGuard)
 * @Get('orders')
 * findOrders() {}
 * ```
 *
 * @implements {CanActivate}
 */
@Injectable()
export class SessionOrJwtGuard implements CanActivate {
  constructor(private readonly sessionGuard: SessionGuard) {}

  /**
   * Determines whether the current request is authorized.
   *
   * @param context - The current execution context provided by NestJS.
   * @returns A promise resolving to `true` if authorization succeeds via
   *          either JWT authentication or session validation.
   */
  async canActivate(context: ExecutionContext): Promise<boolean> {
    // Attempt JWT authentication first (staff access)
    try {
      const jwtGuard = new (AuthGuard('jwt'))();
      const jwtResult = await jwtGuard.canActivate(context);

      if (jwtResult) {
        return true;
      }
    } catch {
      // Ignore JWT errors and fall back to session validation
    }

    // Fallback: validate QR-scanned session device
    return this.sessionGuard.canActivate(context);
  }
}
