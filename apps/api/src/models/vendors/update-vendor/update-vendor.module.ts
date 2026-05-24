import { Module } from '@nestjs/common';
import { UpdateVendorService } from './update-vendor.service';

@Module({
  providers: [UpdateVendorService],
  exports: [UpdateVendorService],
})
export class UpdateVendorModule {}
