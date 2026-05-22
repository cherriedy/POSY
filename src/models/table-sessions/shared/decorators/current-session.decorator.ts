import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { TableSession } from '../entities/table-session';

export const CurrentSession = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): TableSession => {
    const request = ctx
      .switchToHttp()
      .getRequest<Request & { session: TableSession }>();
    return request.session;
  },
);
