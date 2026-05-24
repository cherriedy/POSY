import { Global, Module } from '@nestjs/common';
import { VendorController } from './vendor.controller';
import { VendorRepository } from '@posy/vendors/shared/repositories/vendor-repository.abstract';
import { VendorRepositoryImpl } from '@posy/vendors/shared/repositories/prisma-vendor-repository';
import { CreateVendorService } from '@posy/vendors/features/create-vendor/create-vendor.service';
import { GetVendorsService } from '@posy/vendors/features/get-vendors/get-vendors.service';
import { UpdateVendorService } from '@posy/vendors/features/update-vendor/update-vendor.service';
import { DeleteVendorService } from '@posy/vendors/features/delete-vendor/delete-vendor.service';

@Global()
@Module({
  providers: [
    { provide: VendorRepository, useClass: VendorRepositoryImpl },
    CreateVendorService,
    GetVendorsService,
    UpdateVendorService,
    DeleteVendorService,
  ],
  exports: [VendorRepository],
  controllers: [VendorController],
})
export class VendorModule {}
