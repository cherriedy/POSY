import { Injectable } from '@nestjs/common';
import { TaxRepository } from '../repositories/tax-repository.abstract';
import { TaxQueryParams } from '../interfaces/tax-query-params';
import { TaxNotFoundException } from '../exceptions/tax-not-found.exception';
import { TaxConfig } from '../entities/tax-config';
import { Page } from '../../../common/interfaces/page.interface';

@Injectable()
export class GetTaxesService {
  constructor(private readonly taxRepository: TaxRepository) {}

  /**
   * Retrieves a paginated list of taxes based on the provided query parameters.
   * @param {TaxQueryParams} params - The query parameters for filtering and pagination.
   * @returns {Promise<Page<TaxConfig>>} A promise that resolves to a paginated list of taxes.
   */
  async getAll(params: TaxQueryParams): Promise<Page<TaxConfig>> {
    return this.taxRepository.getAllPaged(params);
  }

  /**
   * Retrieves a tax by its unique identifier.
   * Throws TaxNotFoundException if the tax does not exist.
   * @param {string} id - The unique identifier of the tax.
   * @returns {Promise<TaxConfig>} A promise that resolves to the tax object.
   * @throws {TaxNotFoundException} If the tax is not found.
   */
  async getById(id: string): Promise<TaxConfig> {
    const tax = await this.taxRepository.findById(id);
    if (!tax) throw new TaxNotFoundException({ id });
    return tax;
  }

  /**
   * Retrieves all active taxes.
   * @returns {Promise<TaxConfig[]>} A promise that resolves to an array of active taxes.
   */
  async getAllActive(): Promise<TaxConfig[]> {
    return await this.taxRepository.getActiveTaxes();
  }
}
