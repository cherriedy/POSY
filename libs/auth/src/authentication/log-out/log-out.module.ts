import { Module } from '@nestjs/common';
import { LogOutService } from './log-out.service';

@Module({
  providers: [LogOutService],
  exports: [LogOutService],
})
export class LogOutModule {}
