import { Module } from '@nestjs/common';
import { MailerSendService } from './mailersend.service';
import { AppConfigModule } from '../config/app/config.module';
import { MailerSendConfigModule } from '../config/mailersend/config.module';
import { HandlebarsService } from './handlebars.service';

@Module({
  imports: [AppConfigModule, MailerSendConfigModule],
  providers: [MailerSendService, HandlebarsService],
  exports: [MailerSendService, HandlebarsService],
})
export class MailModule {}
