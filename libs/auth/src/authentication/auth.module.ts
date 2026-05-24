import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { JwtStrategy } from './strategy/jwt.strategy';
import { AppConfigModule } from '@posy/shared';
import { JwtConfigModule } from '@posy/shared';
import { MailModule } from '@posy/shared';
import { ValidateResetCodeModule } from './validate-reset-code/validate-reset-code.module';
import { ResetPasswordModule } from './reset-password/reset-password.module';
import { ForgetPasswordModule } from './forget-password/forget-password.module';
import { SignInModule } from './sign-in/sign-in.module';
import { RefreshAccessTokenModule } from './refresh-access-token/refresh-access-token.module';
import { TokenGeneratorsModule } from './common/token-generators/token-generators.module';
import { LogOutModule } from './log-out/log-out.module';

@Module({
  imports: [
    JwtModule.register({}),
    TokenGeneratorsModule,
    JwtConfigModule,
    MailModule,
    ValidateResetCodeModule,
    ResetPasswordModule,
    ForgetPasswordModule,
    SignInModule,
    RefreshAccessTokenModule,
    AppConfigModule,
    LogOutModule,
  ],
  providers: [JwtStrategy],
  exports: [
    JwtModule,
    TokenGeneratorsModule,
    JwtConfigModule,
    MailModule,
    ValidateResetCodeModule,
    ResetPasswordModule,
    ForgetPasswordModule,
    SignInModule,
    RefreshAccessTokenModule,
    AppConfigModule,
    LogOutModule,
    JwtStrategy,
  ],
})
export class AuthModule {}
