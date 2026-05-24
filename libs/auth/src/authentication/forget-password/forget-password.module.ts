import { Module } from '@nestjs/common';
import { ForgetPasswordService } from './forget-password.service';
import { MailModule } from '@posy/shared';

@Module({
  imports: [MailModule],
  providers: [ForgetPasswordService],
  exports: [ForgetPasswordService],
})
export class ForgetPasswordModule {}
