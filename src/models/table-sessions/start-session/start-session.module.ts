import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { StartSessionService } from './start-session.service';
import { ConfigModule, ConfigService } from '@nestjs/config';

@Module({
  imports: [
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        secret:
          configService.get<string>('JWT_TABLE_SESSION_SECRET') ||
          'table-session-secret',
        signOptions: { expiresIn: '2h' },
      }),
    }),
  ],
  providers: [StartSessionService],
  exports: [StartSessionService],
})
export class StartSessionModule {}
