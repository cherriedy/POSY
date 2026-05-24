import { Injectable } from '@nestjs/common';
import { TaxRepository } from '../../shared/repositories/tax-repository.abstract';
import { TaxConfig } from '../../shared/entities/tax-config';

@Injectable()
export class CreateTaxService {
  constructor(private readonly taxRepository: TaxRepository) {}

  /**
   * Creates a new tax configuration.
   * @param {TaxConfig} tax - The tax object to create.
   * @returns {Promise<TaxConfig>} A promise that resolves to the created tax.
   * @throws {DuplicateEntryError} If a tax with the same unique field already exists.
   */
  async create(tax: TaxConfig): Promise<TaxConfig> {
    return await this.taxRepository.create(tax);
  }
}
