import { Injectable } from '@nestjs/common';
import { TaxRepository } from '../repositories';

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
    await this.taxRepository.delete(id);
  }
}
