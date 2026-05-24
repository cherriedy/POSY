import { Global, Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { AppConfigModule, JwtConfigModule, PrismaModule } from '@posy/shared';
import { TableSessionController } from './table-session.controller';
import { TableSessionGuard } from '@posy/table-sessions/shared/guards/table-session.guard';
import { SessionPreferenceRepository } from '@posy/table-sessions/shared/repositories/session-preference-repository.abstract';
import { PrismaSessionPreferenceRepository } from '@posy/table-sessions/shared/repositories/prisma-session-preference-repository';
import { TableSessionRepository } from '@posy/table-sessions/shared/repositories/table-session-repository.abstract';
import { PrismaTableSessionRepository } from '@posy/table-sessions/shared/repositories/prisma-table-session-repository';
import { TableSessionConfig } from '@posy/table-sessions/table-session.config';
import { StartSessionModule } from '@posy/table-sessions/features/start-session/start-session.module';
import { EndSessionModule } from '@posy/table-sessions/features/end-session/end-session.module';

@Global()
@Module({
  providers: [
    {
      provide: TableSessionRepository,
      useClass: PrismaTableSessionRepository,
    },
    {
      provide: SessionPreferenceRepository,
      useClass: PrismaSessionPreferenceRepository,
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
