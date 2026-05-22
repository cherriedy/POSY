import { Module } from '@nestjs/common';
import { RecordPreferenceService } from './record-preference.service';
import { TableSessionConfig } from '../../table-session.config';
import { AppConfigModule } from '../../../../config/app/config.module';
import { JwtConfigModule } from '../../../../config/jwt/config.module';

@Module({
  imports: [AppConfigModule, JwtConfigModule],
  providers: [RecordPreferenceService, TableSessionConfig],
  exports: [RecordPreferenceService],
})
export class RecordPreferenceModule {}
