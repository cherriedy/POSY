import { Injectable } from '@nestjs/common';
import { VendorRepository } from '../../shared/repositories/vendor-repository.abstract';
import { Vendor } from '../../shared/entities/vendor';
import { VendorNotFoundException } from '../../shared/errors/vendor-not-found.exception';
import { Page } from '@posy/shared';
import { VendorQueryParams } from '../../shared/interfaces/vendor-query-params.interface';

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
