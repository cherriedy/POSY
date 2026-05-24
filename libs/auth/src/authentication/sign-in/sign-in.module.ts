import { Module } from '@nestjs/common';
import { SignInService } from './sign-in.service';
import { TokenGeneratorsModule } from '../common/token-generators/token-generators.module';

@Module({
  imports: [TokenGeneratorsModule],
  providers: [SignInService],
  exports: [SignInService],
})
export class SignInModule {}
