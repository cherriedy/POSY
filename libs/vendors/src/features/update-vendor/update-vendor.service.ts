import { Injectable } from '@nestjs/common';
import { VendorRepository } from '../../shared/repositories/vendor-repository.abstract';
import { Vendor } from '../../shared/entities/vendor';
import { VendorUpdatePayload } from '../../shared/interfaces/vendor-payloads.interface';
import { VendorNotFoundException } from '../../shared/errors/vendor-not-found.exception';

@Injectable()
export class UpdateVendorService {
  constructor(private readonly vendorRepository: VendorRepository) {}

  async update(id: string, payload: VendorUpdatePayload): Promise<Vendor> {
    const vendor = await this.vendorRepository.findById(id);
    if (!vendor) throw new VendorNotFoundException(id);

    return this.vendorRepository.update(id, payload as Partial<Vendor>);
  }
}
