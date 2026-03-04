import { Module } from '@nestjs/common';
import { DeleteVendorService } from './delete-vendor.service';

@Module({
  providers: [DeleteVendorService],
  exports: [DeleteVendorService],
})
export class DeleteVendorModule {}
