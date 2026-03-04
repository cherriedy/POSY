import { Injectable } from '@nestjs/common';
import { VendorRepository } from '../repositories';
import { Vendor } from '../entities';
import { VendorUpdatePayload } from '../interfaces';
import { VendorNotFoundException } from '../exceptions';

@Injectable()
export class UpdateVendorService {
  constructor(private readonly vendorRepository: VendorRepository) { }

  async update(id: string, payload: VendorUpdatePayload): Promise<Vendor> {
    const vendor = await this.vendorRepository.findById(id);
    if (!vendor) throw new VendorNotFoundException(id);

    return this.vendorRepository.update(id, payload as Partial<Vendor>);
  }
}
