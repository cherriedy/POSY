import { Module } from '@nestjs/common';
import { ValidateResetCodeService } from './validate-reset-code.service';
import { JwtModule } from '@nestjs/jwt';
import { JwtConfigModule } from '@posy/shared';

@Module({
  imports: [JwtModule, JwtConfigModule],
  providers: [ValidateResetCodeService],
  exports: [ValidateResetCodeService],
})
export class ValidateResetCodeModule {}
