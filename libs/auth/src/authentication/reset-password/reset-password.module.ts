import { Module } from '@nestjs/common';
import { ResetPasswordService } from './reset-password.service';
import { JwtModule } from '@nestjs/jwt';
import { JwtConfigModule } from '@posy/shared';
import { ResetPasswordCleanupService } from './reset-password-cleanup.service';

@Module({
  imports: [JwtModule, JwtConfigModule],
  providers: [ResetPasswordService, ResetPasswordCleanupService],
  exports: [ResetPasswordService],
})
export class ResetPasswordModule {}
