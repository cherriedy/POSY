import { IngredientCreateUpdateDto } from '../../shared/dto';
import { CreateIngredientPayload } from './create-ingredient.payload';

export class CreateIngredientPayloadMapper {
  static fromDto(dto: IngredientCreateUpdateDto): CreateIngredientPayload {
    return {
      vendorId: dto.vendorId,
      unitId: dto.unitId,
      name: dto.name,
      stock: dto.stock,
      minStock: dto.minStock,
      unitCost: dto.unitCost,
      expiredAt: dto.expiredAt ? new Date(dto.expiredAt) : null,
    };
  }
}
