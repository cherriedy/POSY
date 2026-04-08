import { Module } from '@nestjs/common';
import { RecordPreferenceService } from './record-preference.service';
import { TableSessionConfig } from '../../table-session.config';
import { AppConfigModule, JwtConfigModule } from '../../../../config';

@Module({
  imports: [AppConfigModule, JwtConfigModule],
  providers: [RecordPreferenceService, TableSessionConfig],
  exports: [RecordPreferenceService],
})
export class RecordPreferenceModule {}
