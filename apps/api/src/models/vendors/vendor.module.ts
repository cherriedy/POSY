import { Global, Module } from '@nestjs/common';
import { VendorController } from './vendor.controller';
import { VendorRepository } from './repositories/vendor-repository.abstract';
import { VendorRepositoryImpl } from './repositories/vendor-repository';
import { CreateVendorModule } from './create-vendor/create-vendor.module';
import { GetVendorsModule } from './get-vendors/get-vendors.module';
import { UpdateVendorModule } from './update-vendor/update-vendor.module';
import { DeleteVendorModule } from './delete-vendor/delete-vendor.module';

@Global()
@Module({
  providers: [{ provide: VendorRepository, useClass: VendorRepositoryImpl }],
  exports: [VendorRepository],
  imports: [
    CreateVendorModule,
    GetVendorsModule,
    UpdateVendorModule,
    DeleteVendorModule,
  ],
  controllers: [VendorController],
})
export class VendorModule {}
