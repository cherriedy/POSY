import { Module } from '@nestjs/common';
import { GetVendorsService } from './get-vendors.service';

@Module({
  providers: [GetVendorsService],
  exports: [GetVendorsService],
})
export class GetVendorsModule {}
