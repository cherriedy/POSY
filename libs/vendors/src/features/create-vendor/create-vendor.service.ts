import { Injectable } from '@nestjs/common';
import { VendorRepository } from '../../shared/repositories/vendor-repository.abstract';
import { Vendor } from '../../shared/entities/vendor';
import { VendorCreatePayload } from '../../shared/interfaces/vendor-payloads.interface';

@Injectable()
export class CreateVendorService {
  constructor(private readonly vendorRepository: VendorRepository) {}

  async create(payload: VendorCreatePayload): Promise<Vendor> {
    return this.vendorRepository.create(payload as Vendor);
  }
}
