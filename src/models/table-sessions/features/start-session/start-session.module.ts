import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { TableModule } from 'src/models/tables/table.module';
import { GuestSessionContextService } from './guest-session-context.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { StaffSessionContextService } from './staff-session-context.service';

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
    TableModule,
  ],
  providers: [GuestSessionContextService, StaffSessionContextService],
  exports: [GuestSessionContextService, StaffSessionContextService],
})
export class StartSessionModule {}
