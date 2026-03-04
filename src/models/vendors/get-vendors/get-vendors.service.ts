import { Injectable } from '@nestjs/common';
import { VendorRepository } from '../repositories';
import { Vendor } from '../entities';
import { VendorNotFoundException } from '../exceptions';
import { Page } from '../../../common/interfaces';
import { VendorQueryParams } from '../interfaces';

@Injectable()
export class GetVendorsService {
  constructor(private readonly vendorRepository: VendorRepository) {}

  async getAll(params: VendorQueryParams): Promise<Page<Vendor>> {
    return this.vendorRepository.getAllPaged(params);
  }

  async getById(id: string): Promise<Vendor> {
    const vendor = await this.vendorRepository.findById(id);
    if (!vendor) throw new VendorNotFoundException(id);
    return vendor;
  }
}
