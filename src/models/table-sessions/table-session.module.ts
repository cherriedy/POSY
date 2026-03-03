import { Global, Module } from '@nestjs/common';
import { TableSessionController } from './table-session.controller';
import { PrismaModule } from 'src/providers/prisma/prisma.module';
import { StartSessionModule } from './start-session/start-session.module';
import { EndSessionModule } from './end-session/end-session.module';
import {
  TableSessionRepository,
  TableSessionRepositoryImpl,
} from './repositories';
import { TableSessionConfig } from './table-session.config';
import { SessionGuard } from './guards';
import { JwtModule } from '@nestjs/jwt';
import { AppConfigModule, JwtConfigModule } from 'src/config';

@Global()
@Module({
  providers: [
    {
      provide: TableSessionRepository,
      useClass: TableSessionRepositoryImpl,
    },
    SessionGuard,
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
  exports: [TableSessionRepository, SessionGuard, TableSessionConfig],
})
export class TableSessionModule {}
