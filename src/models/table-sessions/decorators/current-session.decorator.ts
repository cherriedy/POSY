import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { TableSession } from '../types';

export const CurrentSession = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): TableSession => {
    const request = ctx
      .switchToHttp()
      .getRequest<Request & { session: TableSession }>();
    return request.session;
  },
);
