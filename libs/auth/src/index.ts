// authentication - public API only (no services/modules that import from apps/api)
export * from './authentication/auth.module';
export * from './authentication/auth.config';
export * from './authentication/interfaces/jwt-payload.interface';
export * from './authentication/interfaces/auth-tokens-schema.interface';
export * from './authentication/interfaces/reset-token-schema.interface';
export * from './authentication/interfaces/user-identity.interface';
export * from './authentication/errors/access-token-expired.error';
export * from './authentication/errors/account-locked.error';
export * from './authentication/errors/invalid-access-token.error';
export * from './authentication/errors/invalid-credentials.error';
export * from './authentication/errors/invalid-refresh-token.error';
export * from './authentication/errors/invalid-reset-code.error';
export * from './authentication/errors/invalid-reset-token.error';
export * from './authentication/errors/refresh-token-expired.error';
export * from './authentication/errors/reset-code-expired.error';
export * from './authentication/errors/reset-token-expired.error';
export * from './authentication/dto/forgot-password.dto';
export * from './authentication/dto/reset-password.dto';
export * from './authentication/dto/sign-in.dto';
export * from './authentication/dto/validate-reset-code.dto';

// authorization
export * from './authorization/authorization.module';
export * from './authorization/access-control/access-control.module';
export * from './authorization/access-control/access-control.service';
export * from './authorization/guards/role.guard';
