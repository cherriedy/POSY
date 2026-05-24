import { Module } from '@nestjs/common';
import { AuthModule } from '@posy/auth';
import { AuthController } from './auth.controller';

@Module({
  imports: [AuthModule],
  controllers: [AuthController],
})
export class AuthApiModule {}
