import { Global, Module } from '@nestjs/common';
import { VendorController } from './vendor.controller';
import { VendorRepository, VendorRepositoryImpl } from './repositories';
import { CreateVendorModule } from './create-vendor';
import { GetVendorsModule } from './get-vendors';
import { UpdateVendorModule } from './update-vendor';
import { DeleteVendorModule } from './delete-vendor';

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
