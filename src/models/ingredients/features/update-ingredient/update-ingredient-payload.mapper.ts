import { IngredientUpdateRequestDto } from '../../shared/dto';
import { Ingredient } from '../../shared/entities';

export class UpdateIngredientPayloadMapper {
  static fromDto(dto: IngredientUpdateRequestDto): Partial<Ingredient> {
    const payload: Partial<Ingredient> = {};

    if (dto.vendorId !== undefined) payload.vendorId = dto.vendorId;
    if (dto.unitId !== undefined) payload.unitId = dto.unitId;
    if (dto.name !== undefined) payload.name = dto.name;
    if (dto.stock !== undefined) payload.stock = dto.stock;
    if (dto.minStock !== undefined) payload.minStock = dto.minStock;
    if (dto.unitCost !== undefined) payload.unitCost = dto.unitCost;
    if (dto.expiredAt !== undefined)
      payload.expiredAt = dto.expiredAt ? new Date(dto.expiredAt) : null;

    return payload;
  }
}
