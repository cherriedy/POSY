import { Injectable } from '@nestjs/common';
import { TaxRepository } from '../repositories';
import { TaxConfig } from '../types';

@Injectable()
export class CreateTaxService {
  constructor(private readonly taxRepository: TaxRepository) {}

  /**
   * Creates a new tax configuration.
   * @param {TaxConfig} tax - The tax object to create.
   * @returns {Promise<TaxConfig>} A promise that resolves to the created tax.
   * @throws {DuplicateEntryException} If a tax with the same unique field already exists.
   */
  async create(tax: TaxConfig): Promise<TaxConfig> {
    return await this.taxRepository.create(tax);
  }
}
