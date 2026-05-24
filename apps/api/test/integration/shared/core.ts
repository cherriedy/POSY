/* eslint-disable */
import {
  CanActivate,
  ExecutionContext,
  Global,
  Module,
  ValidationPipe,
  INestApplication,
} from '@nestjs/common';
import {
  WINSTON_MODULE_NEST_PROVIDER,
  WINSTON_MODULE_PROVIDER,
} from 'nest-winston';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/client';

export const passThroughGuard: CanActivate = {
  canActivate: (_: ExecutionContext) => true,
};

export const mockLogger = {
  log: jest.fn(),
  warn: jest.fn(),
  error: (err: any) => {
    console.error('MOCK LOGGER ERROR:', err && err.stack ? err.stack : err);
  },
  debug: jest.fn(),
  verbose: jest.fn(),
};

export function createPrismaError(code: string, message = '') {
  return new PrismaClientKnownRequestError(message, {
    code,
    clientVersion: 'test-client',
  });
}

// Apply the shared ValidationPipe used by e2e tests
export function applyValidationPipe(app: INestApplication) {
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );
}

@Global()
@Module({
  providers: [
    { provide: WINSTON_MODULE_NEST_PROVIDER, useValue: mockLogger },
    { provide: WINSTON_MODULE_PROVIDER, useValue: mockLogger },
  ],
  exports: [WINSTON_MODULE_NEST_PROVIDER, WINSTON_MODULE_PROVIDER],
})
export class GlobalMockModule {}
