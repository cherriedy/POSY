import { Injectable } from '@nestjs/common';
import { VendorRepository } from '../repositories';
import { Vendor } from '../entities';
import { VendorUpdatePayload } from '../interfaces';

@Injectable()
export class UpdateVendorService {
  constructor(private readonly vendorRepository: VendorRepository) {}

  async update(id: string, payload: VendorUpdatePayload): Promise<Vendor> {
    const updateData: Partial<Vendor> = {};

    if (payload.name !== undefined) {
      updateData.name = payload.name;
    }
    if (payload.contactName !== null) {
      updateData.contactName = payload.contactName;
    }
    if (payload.email !== null) {
      updateData.email = payload.email;
    }
    if (payload.phone !== null) {
      updateData.phone = payload.phone;
    }
    if (payload.address !== null) {
      updateData.address = payload.address;
    }
    if (payload.taxCode !== null) {
      updateData.taxCode = payload.taxCode;
    }
    if (payload.paymentTerm !== null) {
      updateData.paymentTerm = payload.paymentTerm;
    }
    if (payload.note !== null) {
      updateData.note = payload.note;
    }
    if (payload.status !== null) {
      updateData.status = payload.status;
    }

    return this.vendorRepository.update(id, updateData);
  }
}
