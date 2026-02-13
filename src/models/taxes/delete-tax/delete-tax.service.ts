import { Injectable } from '@nestjs/common';
import { TaxRepository } from '../repositories';
import { TaxNotFoundException } from '../exceptions';

@Injectable()
export class DeleteTaxService {
  constructor(private readonly taxRepository: TaxRepository) {}

  /**
   * Soft deletes a tax configuration by its ID.
   * @param {string} id - The ID of the tax to delete.
   * @returns {Promise<void>}
   * @throws {TaxNotFoundException} If the tax does not exist.
   */
  async delete(id: string): Promise<void> {
    const tax = await this.taxRepository.findById(id);
    if (!tax) {
      throw new TaxNotFoundException({ id });
    }

    await this.taxRepository.delete(id);
  }
}
