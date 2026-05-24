import { Injectable } from '@nestjs/common';
import { VendorRepository } from '../../shared/repositories/vendor-repository.abstract';
import { VendorNotFoundException } from '../../shared/errors/vendor-not-found.exception';

@Injectable()
export class DeleteVendorService {
  constructor(private readonly vendorRepository: VendorRepository) {}

  async delete(id: string): Promise<void> {
    const vendor = await this.vendorRepository.findById(id);
    if (!vendor) throw new VendorNotFoundException(id);
    return this.vendorRepository.delete(id);
  }
}
