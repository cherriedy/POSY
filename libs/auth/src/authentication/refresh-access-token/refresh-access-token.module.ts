import { Module } from '@nestjs/common';
import { RefreshAccessTokenService } from './refresh-access-token.service';
import { TokenGeneratorsModule } from '../common/token-generators/token-generators.module';

@Module({
  imports: [TokenGeneratorsModule],
  providers: [RefreshAccessTokenService],
  exports: [RefreshAccessTokenService],
})
export class RefreshAccessTokenModule {}
