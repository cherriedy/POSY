import { Injectable } from '@nestjs/common';
import { VendorRepository } from '../repositories/vendor-repository.abstract';
import { Vendor } from '../entities/vendor.class';
import { VendorNotFoundException } from '../exceptions/vendor-not-found.exception';
import { Page } from '../../../common/interfaces/page.interface';
import { VendorQueryParams } from '../interfaces/vendor-query-params.interface';

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
