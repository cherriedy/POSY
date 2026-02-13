import { Module } from '@nestjs/common';
import { GetFloorsService } from './get-floors.service';

@Module({
  providers: [GetFloorsService],
  exports: [GetFloorsService],
})
export class GetFloorsModule {}
