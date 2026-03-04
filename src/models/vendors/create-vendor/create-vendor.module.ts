import { Module } from '@nestjs/common';
import { CreateVendorService } from './create-vendor.service';

@Module({
  providers: [CreateVendorService],
  exports: [CreateVendorService],
})
export class CreateVendorModule {}
