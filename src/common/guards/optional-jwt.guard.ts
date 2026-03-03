import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

/**
 * An optional JWT auth guard that does not reject unauthenticated requests.
 * When a valid Bearer token is present, `req.user` is populated as normal.
 * When no token (or an invalid one) is provided, the request continues with
 * `req.user` left as `undefined`.
 */
@Injectable()
export class OptionalJwtGuard extends AuthGuard('jwt') {
  override handleRequest(_err: any, user: any): any {
    // Return the user if authentication succeeded, otherwise return undefined
    // without throwing an error
    return user ?? undefined;
  }
}
