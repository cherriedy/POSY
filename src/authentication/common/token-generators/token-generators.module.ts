import { Module } from '@nestjs/common';
import { TokenGeneratorsService } from './token-generators.service';
import { JwtConfigModule } from '../../../config';
import { JwtModule } from '@nestjs/jwt';
import { TableSessionModule } from '../../../models/table-sessions';

@Module({
  imports: [JwtConfigModule, JwtModule, TableSessionModule],
  providers: [TokenGeneratorsService],
  exports: [TokenGeneratorsService],
})
export class TokenGeneratorsModule {}
