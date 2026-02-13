import { Injectable } from '@nestjs/common';
import { TaxRepository } from '../repositories';
import { TaxConfig } from '../types';
import { UpdateTaxDto } from '../dto';
import { TaxNotFoundException } from '../exceptions';

@Injectable()
export class UpdateTaxService {
  constructor(private readonly taxRepository: TaxRepository) {}

  /**
   * Updates an existing tax configuration.
   * @param {string} id - The ID of the tax to update.
   * @param {UpdateTaxDto} dto - The update data.
   * @returns {Promise<TaxConfig>} A promise that resolves to the updated tax.
   * @throws {TaxNotFoundException} If the tax does not exist.
   * @throws {DuplicateEntryException} If the update would create a duplicate.
   */
  async update(id: string, dto: UpdateTaxDto): Promise<TaxConfig> {
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
      dto.displayName ?? existingTax.displayName,
      dto.description !== undefined ? dto.description : existingTax.description,
      dto.rateType ?? existingTax.rateType,
      dto.chargeRate ?? existingTax.chargeRate,
      dto.isActive !== undefined ? dto.isActive : existingTax.isActive,
      dto.isIncluded !== undefined ? dto.isIncluded : existingTax.isIncluded,
      dto.applyAfterVAT !== undefined
        ? dto.applyAfterVAT
        : existingTax.applyAfterVAT,
      dto.sortOrder ?? existingTax.sortOrder,
      existingTax.isDeleted,
      existingTax.deletedAt,
      existingTax.createdAt,
      new Date(),
      existingTax.orderTaxes,
      existingTax.pricingSnapshotTaxes,
    );

    return await this.taxRepository.update(id, updatedTax);
  }
}
