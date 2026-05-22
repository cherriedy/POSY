import { Global, Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { AppConfigModule, JwtConfigModule } from '../../config';
import { PrismaModule } from '../../providers/prisma/prisma.module';
import { EndSessionModule } from './features/end-session/end-session.module';
import { TableSessionGuard } from './shared/guards/table-session.guard';
import { SessionPreferenceRepository } from './shared/repositories/session-preference-repository.abstract';
import { SessionPreferenceRepositoryImpl } from './shared/repositories/session-preference-repository';
import { TableSessionRepository } from './shared/repositories/table-session-repository.abstract';
import { TableSessionRepositoryImpl } from './shared/repositories/table-session-repository';
import { StartSessionModule } from './features/start-session/start-session.module';
import { TableSessionConfig } from './table-session.config';
import { TableSessionController } from './table-session.controller';

@Global()
@Module({
  providers: [
    {
      provide: TableSessionRepository,
      useClass: TableSessionRepositoryImpl,
    },
    {
      provide: SessionPreferenceRepository,
      useClass: SessionPreferenceRepositoryImpl,
    },
    TableSessionGuard,
    TableSessionConfig,
  ],
  imports: [
    PrismaModule,
    StartSessionModule,
    EndSessionModule,
    JwtModule,
    AppConfigModule,
    JwtConfigModule,
  ],
  controllers: [TableSessionController],
  exports: [
    TableSessionRepository,
    SessionPreferenceRepository,
    TableSessionGuard,
    TableSessionConfig,
  ],
})
export class TableSessionModule {}
