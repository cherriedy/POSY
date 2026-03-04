import { Injectable } from '@nestjs/common';
import { VendorRepository } from '../repositories';
import { Vendor } from '../entities';
import { VendorCreatePayload } from '../interfaces';

@Injectable()
export class CreateVendorService {
  constructor(private readonly vendorRepository: VendorRepository) {}

  async create(payload: VendorCreatePayload): Promise<Vendor> {
    return this.vendorRepository.create(payload as Vendor);
  }
}
