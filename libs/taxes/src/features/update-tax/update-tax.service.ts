import { Injectable } from '@nestjs/common';
import { TaxRepository } from '../../shared/repositories/tax-repository.abstract';
import { TaxConfig } from '../../shared/entities/tax-config';
import { TaxUpdateRequestDto } from '../../shared/dto/tax-requests.dto';
import { TaxNotFoundException } from '../../shared/errors/tax-not-found.exception';

@Injectable()
export class UpdateTaxService {
  constructor(private readonly taxRepository: TaxRepository) {}

  /**
   * Updates an existing tax configuration.
   * @param {string} id - The ID of the tax to update.
   * @param {TaxUpdateRequestDto} dto - The update data.
   * @returns {Promise<TaxConfig>} A promise that resolves to the updated tax.
   * @throws {TaxNotFoundException} If the tax does not exist.
   * @throws {DuplicateEntryError} If the update would create a duplicate.
   */
  async update(id: string, dto: TaxUpdateRequestDto): Promise<TaxConfig> {
    // Check if tax exists
    const existingTax = await this.taxRepository.findById(id);
    if (!existingTax) {
      throw new TaxNotFoundException({ id });
    }

    // Update the tax
    const updatedTax = new TaxConfig(
      existingTax.id,
      dto.type ?? existingTax.type,
      dto.name ?? existingTax.name,
      dto.description !== undefined ? dto.description : existingTax.description,
      dto.rateType ?? existingTax.rateType,
      dto.chargeRate ?? existingTax.chargeRate,
      dto.isActive !== undefined ? dto.isActive : existingTax.isActive,
      dto.isIncluded !== undefined ? dto.isIncluded : existingTax.isIncluded,
      dto.sortOrder ?? existingTax.sortOrder,
      existingTax.isDeleted,
      existingTax.deletedAt,
      existingTax.createdAt,
      new Date(),
    );

    return await this.taxRepository.update(id, updatedTax);
  }
}
