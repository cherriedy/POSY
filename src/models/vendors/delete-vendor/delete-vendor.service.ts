import { Injectable } from '@nestjs/common';
import { VendorRepository } from '../repositories';

@Injectable()
export class DeleteVendorService {
  constructor(private readonly vendorRepository: VendorRepository) {}

  async delete(id: string): Promise<void> {
    return this.vendorRepository.delete(id);
  }
}
