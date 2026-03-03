import { Module } from '@nestjs/common';
import { EndSessionService } from './end-session.service';

@Module({
  providers: [EndSessionService],
  exports: [EndSessionService],
})
export class EndSessionModule {}
