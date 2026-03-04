import { Injectable } from '@nestjs/common';
import { VendorRepository } from '../repositories';
import { Vendor } from '../entities';
import { VendorCreatePayload } from '../interfaces';

@Injectable()
export class CreateVendorService {
  constructor(private readonly vendorRepository: VendorRepository) {}

  async create(payload: VendorCreatePayload): Promise<Vendor> {
    const vendor = new Vendor(
      undefined,
      payload.name,
      payload.contactName,
      payload.email,
      payload.phone,
      payload.address,
      payload.taxCode,
      payload.paymentTerm,
      payload.note,
      payload.status,
      null,
      null,
      null,
      false,
      null,
      null,
      null,
    );
    return this.vendorRepository.create(vendor);
  }
}
