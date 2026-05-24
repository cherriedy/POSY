import { Module } from '@nestjs/common';
import { ForgetPasswordService } from './forget-password.service';
import { UserModule } from '../../models/users/user.module';
import { MailModule } from '@posy/shared';

@Module({
  imports: [UserModule, MailModule],
  providers: [ForgetPasswordService],
  exports: [ForgetPasswordService],
})
export class ForgetPasswordModule {}
